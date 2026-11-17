type RewardStatus = "earned" | "cancelled" | "failed" | "unavailable";

export interface NativeAdCapabilities {
  ready: boolean;
  enabled: boolean;
  placements: string[];
  interstitialBreaks: boolean;
  bridgeToken: string;
}

interface PendingRequests {
  rewardRequestId?: string;
  breakRequestId?: string;
}

interface PendingResult<T> {
  resolve: (result: T) => void;
  timeoutId: number;
}

declare global {
  interface Window {
    GameHost?: { postMessage: (message: string) => void };
    BlockFallHost?: { receive: (message: unknown) => void };
  }
}

const PENDING_KEY = "blockfall.nativeAds.pending.v1";
const RESULT_TIMEOUT_MS = 120_000;

/** Native AdMob adapter for the LinkSchool Flutter WebView bridge. */
class NativeGameAds {
  private state: NativeAdCapabilities = {
    ready: false,
    enabled: false,
    placements: [],
    interstitialBreaks: false,
    bridgeToken: "",
  };
  private pending: PendingRequests = {};
  private rewardWaiters = new Map<string, PendingResult<RewardStatus>>();
  private breakWaiters = new Map<string, PendingResult<string>>();
  private listeners = new Set<(state: NativeAdCapabilities) => void>();

  constructor() {
    if (typeof window === "undefined") return;
    this.pending = this.readPending();
    window.BlockFallHost = { receive: (message) => this.receive(message) };
    this.sendReady();
    window.addEventListener("load", () => this.sendReady(), { once: true });
  }

  get capabilities(): NativeAdCapabilities {
    return this.state;
  }

  subscribe(listener: (state: NativeAdCapabilities) => void): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  async requestRewarded(placement: string): Promise<RewardStatus> {
    if (
      !window.GameHost ||
      !this.state.ready ||
      !this.state.enabled ||
      !this.state.placements.includes(placement)
    ) {
      return "unavailable";
    }

    const requestId = this.makeId();
    this.pending.rewardRequestId = requestId;
    this.persistPending();
    const result = this.waitFor(this.rewardWaiters, requestId, "unavailable");
    try {
      this.post({
        version: 1,
        type: "rewarded.request",
        requestId,
        placement,
      });
    } catch {
      this.finishReward(requestId, "unavailable");
    }
    return result;
  }

  async requestRetryInterstitial(): Promise<string> {
    if (
      !window.GameHost ||
      !this.state.ready ||
      !this.state.interstitialBreaks
    ) {
      return "unavailable";
    }

    const requestId = this.makeId();
    this.pending.breakRequestId = requestId;
    this.persistPending();
    const result = this.waitFor(this.breakWaiters, requestId, "unavailable");
    try {
      this.post({
        version: 1,
        type: "interstitial.break.request",
        requestId,
        placement: "retry",
      });
    } catch {
      this.finishBreak(requestId, "unavailable");
    }
    return result;
  }

  private receive(raw: unknown) {
    if (!raw || typeof raw !== "object") return;
    const message = raw as Record<string, unknown>;
    if (message.type === "rewarded.capabilities") {
      this.state = {
        ready: true,
        enabled: message.enabled === true,
        placements: Array.isArray(message.placements)
          ? message.placements.filter((item): item is string => typeof item === "string")
          : [],
        interstitialBreaks: message.interstitialBreaks === true,
        bridgeToken:
          typeof message.bridgeToken === "string" ? message.bridgeToken : "",
      };
      this.notify();
      return;
    }

    if (message.type === "interstitial.break.result") {
      if (typeof message.requestId === "string") {
        this.finishBreak(
          message.requestId,
          typeof message.status === "string" ? message.status : "failed",
        );
      }
      return;
    }

    // Reward receipts are sent as {requestId, status}; acknowledge even when
    // a page reload means no in-memory promise is waiting for the result.
    if (
      typeof message.requestId === "string" &&
      typeof message.status === "string"
    ) {
      const status: RewardStatus = ["earned", "cancelled", "failed", "unavailable"].includes(
        message.status,
      )
        ? (message.status as RewardStatus)
        : "failed";
      this.post({
        version: 1,
        type: "rewarded.ack",
        bridgeToken: this.state.bridgeToken,
        requestId: message.requestId,
      });
      this.finishReward(message.requestId, status);
    }
  }

  private waitFor<T>(
    waiters: Map<string, PendingResult<T>>,
    requestId: string,
    timeoutResult: T,
  ): Promise<T> {
    return new Promise((resolve) => {
      const timeoutId = window.setTimeout(
        () => {
          this.finish(waiters, requestId, timeoutResult);
          const key = waiters === this.rewardWaiters
            ? "rewardRequestId"
            : "breakRequestId";
          this.clearPending(key, requestId);
        },
        RESULT_TIMEOUT_MS,
      );
      waiters.set(requestId, { resolve, timeoutId });
    });
  }

  private finishReward(requestId: string, result: RewardStatus) {
    this.clearPending("rewardRequestId", requestId);
    this.finish(this.rewardWaiters, requestId, result);
  }

  private finishBreak(requestId: string, result: string) {
    this.clearPending("breakRequestId", requestId);
    this.finish(this.breakWaiters, requestId, result);
  }

  private finish<T>(
    waiters: Map<string, PendingResult<T>>,
    requestId: string,
    result: T,
  ) {
    const waiter = waiters.get(requestId);
    if (!waiter) return;
    window.clearTimeout(waiter.timeoutId);
    waiters.delete(requestId);
    waiter.resolve(result);
  }

  private clearPending(key: keyof PendingRequests, requestId: string) {
    if (this.pending[key] !== requestId) return;
    delete this.pending[key];
    this.persistPending();
  }

  private readPending(): PendingRequests {
    try {
      const raw = window.localStorage.getItem(PENDING_KEY);
      const value = raw ? (JSON.parse(raw) as PendingRequests) : {};
      return {
        ...(typeof value.rewardRequestId === "string"
          ? { rewardRequestId: value.rewardRequestId }
          : {}),
        ...(typeof value.breakRequestId === "string"
          ? { breakRequestId: value.breakRequestId }
          : {}),
      };
    } catch {
      return {};
    }
  }

  private persistPending() {
    try {
      window.localStorage.setItem(PENDING_KEY, JSON.stringify(this.pending));
    } catch {
      // Bridge results still work for this page session without persistence.
    }
  }

  private sendReady() {
    if (!window.GameHost) return;
    this.post({
      version: 1,
      type: "rewarded.ready",
      pendingRequestId: this.pending.rewardRequestId,
      pendingBreakRequestId: this.pending.breakRequestId,
    });
  }

  private post(message: Record<string, unknown>) {
    window.GameHost?.postMessage(JSON.stringify(message));
  }

  private makeId(): string {
    const randomId = window.crypto?.randomUUID?.();
    return `bf_${randomId ?? `${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`}`;
  }

  private notify() {
    for (const listener of this.listeners) listener(this.state);
  }
}

export const nativeGameAds = new NativeGameAds();
