import { useEffect } from 'react';
import Mascot from './Mascot';
import Icon from './Icons';
import { playLevelUpSound } from '../../utils/audio';

/**
 * Level-Up Celebration Modal Overlay
 * Pops up once whenever the player advances a level.
 */
export default function LevelUpOverlay({ level, onClose }) {
  useEffect(() => {
    playLevelUpSound();
  }, []);

  return (
    <div
      className="levelup-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(30, 27, 46, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        zIndex: 10000,
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Level Up Celebration"
    >
      <div
        className="levelup-card reward-pop"
        style={{
          background: 'var(--surface)',
          border: '3px solid var(--ink)',
          borderRadius: '20px',
          boxShadow: '6px 6px 0 var(--ink)',
          padding: '28px 24px',
          width: '100%',
          maxWidth: '380px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '14px',
        }}
      >
        <span
          className="badge-pill"
          style={{
            background: 'var(--sun)',
            color: 'var(--ink)',
            border: '2px solid var(--ink)',
            boxShadow: '2px 2px 0 var(--ink)',
            fontWeight: 900,
            fontSize: '0.88rem',
            padding: '6px 14px',
          }}
        >
          <Icon name="star" size={14} />
          <span>RANK ADVANCEMENT</span>
        </span>

        <Mascot state="happy" size={88} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <h2 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-display)', fontWeight: 900, color: 'var(--ink)' }}>
            LEVEL UP!
          </h2>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--tomato)' }}>
            You reached Level {level}!
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '4px' }}>
            New challenge tiers unlocked! Keep climbing the ranks!
          </p>
        </div>

        <button
          type="button"
          className="btn-primary"
          style={{ width: '100%', marginTop: '8px', fontSize: '1.05rem' }}
          onClick={onClose}
        >
          <Icon name="check" size={16} />
          <span>AWESOME!</span>
        </button>
      </div>
    </div>
  );
}
