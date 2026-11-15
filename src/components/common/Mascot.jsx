/**
 * Little Big World — Mascot (Blobby Arcade Buddy)
 * Clean vector SVG blob character with 3 states: idle, happy, sad.
 */
export default function Mascot({ state = 'idle', size = 56, className = '' }) {
  return (
    <div
      className={`mascot-wrap mascot-${state} ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Drop Shadow Filter for Sticker Feel */}
        <defs>
          <filter id={`mascot-shadow-${state}`} x="0" y="0" width="100" height="100" filterUnits="userSpaceOnUse">
            <feDropShadow dx="3" dy="3" stdDeviation="0" floodColor="var(--ink)" floodOpacity="1" />
          </filter>
        </defs>

        {/* Outer Sticker Border / Body */}
        {state === 'happy' ? (
          // Bouncy squished happy blob
          <path
            d="M50 12 C78 12 92 28 90 54 C88 78 74 88 50 88 C26 88 12 78 10 54 C8 28 22 12 50 12 Z"
            fill="var(--sun)"
            stroke="var(--ink)"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
        ) : state === 'sad' ? (
          // Droopy puddle sad blob
          <path
            d="M50 20 C74 20 86 36 88 64 C90 84 76 90 50 90 C24 90 10 84 12 64 C14 36 26 20 50 20 Z"
            fill="var(--teal)"
            stroke="var(--ink)"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
        ) : (
          // Balanced perky idle blob
          <path
            d="M50 14 C76 14 88 30 88 56 C88 80 74 88 50 88 C26 88 12 80 12 56 C12 30 24 14 50 14 Z"
            fill="var(--sun)"
            stroke="var(--ink)"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
        )}

        {/* Blush Cheeks */}
        <circle cx="28" cy="58" r="6" fill="var(--tomato)" opacity="0.45" />
        <circle cx="72" cy="58" r="6" fill="var(--tomato)" opacity="0.45" />

        {/* EYES & EXPRESSION */}
        {state === 'happy' && (
          <g>
            {/* Joyful closed eyes ^ ^ */}
            <path
              d="M30 46 Q37 38 44 46"
              stroke="var(--ink)"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <path
              d="M56 46 Q63 38 70 46"
              stroke="var(--ink)"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            {/* Big Open Happy Mouth */}
            <path
              d="M40 56 Q50 72 60 56 Z"
              fill="var(--tomato)"
              stroke="var(--ink)"
              strokeWidth="3"
            />
            {/* Sparkles */}
            <path d="M18 20 L21 27 L28 30 L21 33 L18 40 L15 33 L8 30 L15 27 Z" fill="var(--pink)" stroke="var(--ink)" strokeWidth="1.5" />
            <path d="M82 18 L84 23 L89 25 L84 27 L82 32 L80 27 L75 25 L80 23 Z" fill="var(--teal)" stroke="var(--ink)" strokeWidth="1.5" />
          </g>
        )}

        {state === 'sad' && (
          <g>
            {/* Tearful/droopy eyes */}
            <circle cx="36" cy="48" r="5" fill="var(--ink)" />
            <circle cx="64" cy="48" r="5" fill="var(--ink)" />
            <circle cx="34" cy="46" r="2" fill="#FFFFFF" />
            <circle cx="62" cy="46" r="2" fill="#FFFFFF" />
            {/* Tear drop */}
            <path
              d="M74 54 C74 54 78 60 78 63 C78 65 76 67 74 67 C72 67 70 65 70 63 C70 60 74 54 74 54 Z"
              fill="var(--teal)"
              stroke="var(--ink)"
              strokeWidth="1.5"
            />
            {/* Frown mouth */}
            <path
              d="M42 66 Q50 58 58 66"
              stroke="var(--ink)"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </g>
        )}

        {state === 'idle' && (
          <g>
            {/* Cute round eyes with catchlights */}
            <circle cx="36" cy="46" r="5" fill="var(--ink)" />
            <circle cx="64" cy="46" r="5" fill="var(--ink)" />
            <circle cx="34" cy="44" r="2" fill="#FFFFFF" />
            <circle cx="62" cy="44" r="2" fill="#FFFFFF" />
            {/* Friendly smile */}
            <path
              d="M44 56 Q50 63 56 56"
              stroke="var(--ink)"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </g>
        )}
      </svg>
    </div>
  );
}
