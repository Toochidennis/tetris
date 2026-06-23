// Illustrated game-character avatars rendered as inline SVG (no bundled assets).
// Each fills its parent box. IDs are referenced from the Onboarding screen.

type AvatarProps = { size?: number };

export const AVATAR_META = [
  { id: 0, name: "Robot", color: "#38BDF8" },
  { id: 1, name: "King", color: "#F59E0B" },
  { id: 2, name: "Star", color: "#FACC15" },
  { id: 3, name: "Monster", color: "#22C55E" },
  { id: 4, name: "Ninja", color: "#A855F7" },
];

function Robot({ size = 44 }: AvatarProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <defs>
        <linearGradient id="rob-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5ad1f0" />
          <stop offset="1" stopColor="#1f7fa8" />
        </linearGradient>
      </defs>
      <line x1="32" y1="6" x2="32" y2="14" stroke="#7be9ff" strokeWidth="2.5" />
      <circle cx="32" cy="6" r="3" fill="#7be9ff" />
      <rect x="13" y="14" width="38" height="34" rx="11" fill="url(#rob-g)" stroke="#bdefff" strokeWidth="1.5" />
      <rect x="18" y="22" width="28" height="15" rx="6" fill="#072b38" />
      <circle cx="26" cy="29.5" r="3.4" fill="#7be9ff" />
      <circle cx="38" cy="29.5" r="3.4" fill="#7be9ff" />
      <rect x="24" y="42" width="16" height="3" rx="1.5" fill="#072b38" />
      <rect x="9" y="26" width="4" height="11" rx="2" fill="#1f7fa8" />
      <rect x="51" y="26" width="4" height="11" rx="2" fill="#1f7fa8" />
    </svg>
  );
}

function King({ size = 44 }: AvatarProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <defs>
        <linearGradient id="king-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffb259" />
          <stop offset="1" stopColor="#d97824" />
        </linearGradient>
      </defs>
      {/* crown */}
      <path d="M16 20 L22 27 L32 16 L42 27 L48 20 L46 33 L18 33 Z" fill="#ffd23f" stroke="#ffe585" strokeWidth="1.4" strokeLinejoin="round" />
      <circle cx="16" cy="20" r="2.4" fill="#ffe585" />
      <circle cx="32" cy="16" r="2.6" fill="#ffe585" />
      <circle cx="48" cy="20" r="2.4" fill="#ffe585" />
      {/* face */}
      <rect x="18" y="32" width="28" height="22" rx="10" fill="url(#king-g)" stroke="#ffd6a8" strokeWidth="1.3" />
      <circle cx="27" cy="42" r="2.6" fill="#3a1e08" />
      <circle cx="37" cy="42" r="2.6" fill="#3a1e08" />
      <path d="M27 48 Q32 51 37 48" stroke="#3a1e08" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function Star({ size = 44 }: AvatarProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <defs>
        <linearGradient id="star-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff09a" />
          <stop offset="1" stopColor="#f5a623" />
        </linearGradient>
      </defs>
      <path
        d="M32 8 L40 25 L58 27.5 L45 40 L48 58 L32 49 L16 58 L19 40 L6 27.5 L24 25 Z"
        fill="url(#star-g)" stroke="#fff3c4" strokeWidth="1.6" strokeLinejoin="round"
      />
      <circle cx="26" cy="31" r="2.4" fill="#7a4a08" />
      <circle cx="38" cy="31" r="2.4" fill="#7a4a08" />
      <path d="M27 37 Q32 40 37 37" stroke="#7a4a08" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function Monster({ size = 44 }: AvatarProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <defs>
        <linearGradient id="mon-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5cf08a" />
          <stop offset="1" stopColor="#16a34a" />
        </linearGradient>
      </defs>
      {/* horns */}
      <path d="M18 16 L22 26 L14 24 Z" fill="#16a34a" />
      <path d="M46 16 L42 26 L50 24 Z" fill="#16a34a" />
      <path d="M14 30 Q14 18 32 18 Q50 18 50 30 L50 42 Q50 52 32 52 Q14 52 14 42 Z" fill="url(#mon-g)" stroke="#bbf7d0" strokeWidth="1.4" />
      {/* eyes */}
      <circle cx="25" cy="33" r="5.5" fill="#fff" />
      <circle cx="39" cy="33" r="5.5" fill="#fff" />
      <circle cx="25" cy="34" r="2.6" fill="#0a2e16" />
      <circle cx="39" cy="34" r="2.6" fill="#0a2e16" />
      {/* mouth + teeth */}
      <path d="M23 43 H41 L38 48 L35 44 L32 48 L29 44 L26 48 Z" fill="#0a2e16" />
    </svg>
  );
}

function Ninja({ size = 44 }: AvatarProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <defs>
        <linearGradient id="ninja-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c084fc" />
          <stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="20" fill="url(#ninja-g)" stroke="#e9d5ff" strokeWidth="1.5" />
      {/* mask band */}
      <path d="M12 28 H52 V37 H12 Z" fill="#3b1d6e" />
      <path d="M52 30 L60 26 L58 34 Z" fill="#3b1d6e" />
      {/* eyes */}
      <path d="M22 32 L30 30 L29 34 L22 34 Z" fill="#fff" />
      <path d="M42 32 L34 30 L35 34 L42 34 Z" fill="#fff" />
      <circle cx="26" cy="32.5" r="1.7" fill="#1e1033" />
      <circle cx="38" cy="32.5" r="1.7" fill="#1e1033" />
    </svg>
  );
}

const RENDERERS = [Robot, King, Star, Monster, Ninja];

export function Avatar({ id, size }: { id: number; size?: number }) {
  const Comp = RENDERERS[id] ?? Robot;
  return <Comp size={size} />;
}
