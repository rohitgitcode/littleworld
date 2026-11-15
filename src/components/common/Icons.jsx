/**
 * Inline SVG Icon System
 * 
 * Handcrafted vector icons for Little Big World arcade UI.
 * Zero external libraries, lightweight, scalable, and styled via currentColor.
 */

export default function Icon({ name, size = 18, className = '', style = {} }) {
  const props = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '2',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    className: `arcade-icon ${className}`,
    style: { verticalAlign: 'middle', flexShrink: 0, ...style },
    'aria-hidden': 'true',
  };

  switch (name) {
    case 'home':
      return (
        <svg {...props}>
          <path d="M3 10.5L12 3l9 7.5v9a1.5 1.5 0 0 1-1.5 1.5H4.5A1.5 1.5 0 0 1 3 19.5v-9z" />
          <path d="M9 21v-7a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v7" />
        </svg>
      );
    case 'world':
    case 'map':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3.6 9h16.8M3.6 15h16.8" />
          <path d="M11.5 3a13 13 0 0 0 0 18M12.5 3a13 13 0 0 1 0 18" />
        </svg>
      );
    case 'trophy':
      return (
        <svg {...props}>
          <path d="M8 21h8m-4-4v4M6 4h12v4a6 6 0 0 1-12 0V4z" />
          <path d="M6 7H3a2 2 0 0 0-2 2v1a4 4 0 0 0 4 4h1M18 7h3a2 2 0 0 1 2 2v1a4 4 0 0 1-4 4h-1" />
        </svg>
      );
    case 'profile':
    case 'user':
      return (
        <svg {...props}>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
    case 'settings':
    case 'gear':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      );
    case 'gamepad':
    case 'controller':
      return (
        <svg {...props}>
          <rect x="2" y="6" width="20" height="12" rx="4" />
          <path d="M6 12h4M8 10v4M15 11h.01M18 13h.01" strokeWidth="2.5" />
        </svg>
      );
    case 'bolt':
    case 'lightning':
      return (
        <svg {...props}>
          <path d="M13 2L3 14h8l-2 8 10-12h-8l2-8z" />
        </svg>
      );
    case 'brain':
      return (
        <svg {...props}>
          <path d="M9.5 2A4.5 4.5 0 0 0 5 6.5c0 .6.1 1.2.3 1.7A4 4 0 0 0 3 12a4 4 0 0 0 2 3.5c-.1.5-.1 1-.1 1.5a4.5 4.5 0 0 0 4.5 4.5c1 0 2-.3 2.8-.9.7.9 1.7 1.4 2.8 1.4a4.5 4.5 0 0 0 4.5-4.5c0-.5 0-1-.1-1.5A4 4 0 0 0 21 12a4 4 0 0 0-2.3-3.8c.2-.5.3-1.1.3-1.7A4.5 4.5 0 0 0 14.5 2c-1.1 0-2.1.5-2.8 1.4A4.5 4.5 0 0 0 9.5 2z" />
          <path d="M12 4v16M8 8h1M8 16h1M16 8h-1M16 16h-1" />
        </svg>
      );
    case 'puzzle':
    case 'diamond':
    case 'pattern':
      return (
        <svg {...props}>
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
      );
    case 'tower':
    case 'crown':
      return (
        <svg {...props}>
          <path d="M4 21h16M5 21V7l4 3 3-6 3 6 4-3v14H5z" />
        </svg>
      );
    case 'coin':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="5" strokeDasharray="3 3" />
        </svg>
      );
    case 'star':
      return (
        <svg {...props}>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      );
    case 'fire':
    case 'flame':
      return (
        <svg {...props}>
          <path d="M8.5 14.5A3.5 3.5 0 0 0 12 18a3.5 3.5 0 0 0 3.5-3.5C15.5 10 12 8 12 8s-3.5 2-3.5 6.5z" />
          <path d="M12 2c1 3.5 5 5 5 10a5 5 0 0 1-10 0c0-3 2-6 5-10z" />
        </svg>
      );
    case 'clock':
    case 'timer':
      return (
        <svg {...props}>
          <circle cx="12" cy="13" r="8" />
          <path d="M12 9v4l2.5 1.5M12 2v3M9 2h6" />
        </svg>
      );
    case 'check':
      return (
        <svg {...props}>
          <polyline points="20 6 9 17 4 12" />
        </svg>
      );
    case 'close':
    case 'x':
      return (
        <svg {...props}>
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      );
    case 'pause':
      return (
        <svg {...props}>
          <rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none" />
          <rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'laser':
      return (
        <svg {...props}>
          <rect x="2" y="9" width="6" height="6" rx="1" fill="currentColor" />
          <line x1="8" y1="12" x2="22" y2="12" strokeWidth="2.5" />
          <line x1="16" y1="6" x2="22" y2="12" />
          <line x1="16" y1="18" x2="22" y2="12" />
        </svg>
      );
    case 'mirror':
      return (
        <svg {...props}>
          <line x1="4" y1="20" x2="20" y2="4" strokeWidth="3" />
          <line x1="10" y1="17" x2="13" y2="20" strokeWidth="1.5" />
          <line x1="14" y1="13" x2="17" y2="16" strokeWidth="1.5" />
          <line x1="18" y1="9" x2="21" y2="12" strokeWidth="1.5" />
        </svg>
      );
    case 'bomb':
      return (
        <svg {...props}>
          <circle cx="11" cy="13" r="8" />
          <path d="M14.5 4.5l2-2" />
          <path d="M16 2.5l2 2" />
          <path d="M19 1l-1 2" />
        </svg>
      );
    case 'play':
      return (
        <svg {...props}>
          <polygon points="6 4 20 12 6 20 6 4" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'refresh':
    case 'replay':
      return (
        <svg {...props}>
          <path d="M21.5 2v6h-6M2.5 22v-6h6" />
          <path d="M20 13a8 8 0 0 1-14.7 3.5L2.5 16M4 11a8 8 0 0 1 14.7-3.5L21.5 8" />
        </svg>
      );
    case 'lock':
      return (
        <svg {...props}>
          <rect x="4" y="11" width="16" height="10" rx="2" />
          <path d="M8 11V7a4 4 0 0 1 8 0v4" />
        </svg>
      );
    case 'arrowRight':
      return (
        <svg {...props}>
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      );
    case 'arrowLeft':
      return (
        <svg {...props}>
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
      );
    case 'volume':
      return (
        <svg {...props}>
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14" />
        </svg>
      );
    case 'menu':
      return (
        <svg {...props}>
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      );
    case 'sparkle':
      return (
        <svg {...props}>
          <path d="M12 2l2.4 6.8L21 11l-6.6 2.2L12 20l-2.4-6.8L3 11l6.6-2.2z" />
        </svg>
      );
    default:
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" />
        </svg>
      );
  }
}
