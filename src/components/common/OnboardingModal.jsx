import { useState } from 'react';
import Mascot from './Mascot';
import Icon from './Icons';

/**
 * Little Big World — First-Run Onboarding Modal
 * 3 short slides: Welcome -> Persona Selection (name + 6 avatars) -> How to Play
 */
export default function OnboardingModal({ onComplete }) {
  const [slide, setSlide] = useState(0);
  const [playerName, setPlayerName] = useState('ArcadeRider');
  const [selectedAvatar, setSelectedAvatar] = useState('controller');

  const avatarOptions = ['controller', 'bolt', 'brain', 'puzzle', 'tower', 'user'];

  const handleFinish = () => {
    onComplete(playerName.trim() || 'ArcadePlayer', selectedAvatar);
  };

  return (
    <div
      className="onboarding-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(30, 27, 46, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        zIndex: 9999,
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to Pixarcade"
    >
      <div
        className="onboarding-card"
        style={{
          background: 'var(--surface)',
          border: '3px solid var(--ink)',
          borderRadius: '16px',
          boxShadow: '6px 6px 0 var(--ink)',
          padding: '24px 20px',
          width: '100%',
          maxWidth: '440px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '16px',
          position: 'relative',
        }}
      >
        {/* Step Indicator Dots */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: i === slide ? '22px' : '10px',
                height: '10px',
                borderRadius: '999px',
                background: i === slide ? 'var(--sun)' : 'var(--surface-2)',
                border: '2px solid var(--ink)',
                transition: 'width 140ms ease',
              }}
            />
          ))}
        </div>

        {/* SLIDE 0: WELCOME */}
        {slide === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <Mascot state="happy" size={76} />
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text)' }}>
              Welcome to Pixarcade!
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.45 }}>
              A handcrafted indie sticker arcade where you test your reaction reflexes, pattern puzzles, and sequence memory.
            </p>
            <button
              type="button"
              className="btn-primary"
              style={{ width: '100%', marginTop: '10px' }}
              onClick={() => setSlide(1)}
            >
              <span>Meet Your Persona</span>
              <Icon name="play" size={14} />
            </button>
          </div>
        )}

        {/* SLIDE 1: CHOOSE NICKNAME & AVATAR */}
        {slide === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', width: '100%' }}>
            <Mascot state="idle" size={60} />
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Create Your Arcade Tag</h2>

            <div style={{ width: '100%', textAlign: 'left' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>
                PLAYER NAME:
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                maxLength={14}
                style={{
                  width: '100%',
                  background: 'var(--surface-2)',
                  border: '3px solid var(--ink)',
                  borderRadius: '12px',
                  padding: '10px 12px',
                  fontSize: '1rem',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  color: 'var(--ink)',
                  boxShadow: '3px 3px 0 var(--ink)',
                }}
              />
            </div>

            <div style={{ width: '100%', textAlign: 'left' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: '6px' }}>
                SELECT ICON:
              </label>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                {avatarOptions.map((av) => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => setSelectedAvatar(av)}
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      background: selectedAvatar === av ? 'var(--sun)' : 'var(--surface-2)',
                      border: '3px solid var(--ink)',
                      boxShadow: selectedAvatar === av ? '3px 3px 0 var(--ink)' : '2px 2px 0 var(--ink)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--ink)',
                      cursor: 'pointer',
                    }}
                  >
                    <Icon name={av} size={20} />
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', width: '100%', marginTop: '8px' }}>
              <button
                type="button"
                className="btn-secondary"
                style={{ flex: 1 }}
                onClick={() => setSlide(0)}
              >
                Back
              </button>
              <button
                type="button"
                className="btn-primary"
                style={{ flex: 2 }}
                onClick={() => setSlide(2)}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* SLIDE 2: HOW TO PLAY */}
        {slide === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', width: '100%' }}>
            <Mascot state="happy" size={60} />
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>How To Play</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', textAlign: 'left' }}>
              <div style={{ background: 'var(--surface-2)', border: '2px solid var(--ink)', borderRadius: '10px', padding: '8px 12px', fontSize: '0.82rem' }}>
                ⚡ <strong>Reaction Reactor:</strong> Tap appearing targets fast before they expire!
              </div>
              <div style={{ background: 'var(--surface-2)', border: '2px solid var(--ink)', borderRadius: '10px', padding: '8px 12px', fontSize: '0.82rem' }}>
                🧠 <strong>Memory Maze:</strong> Watch the tile sequence and repeat it accurately!
              </div>
              <div style={{ background: 'var(--surface-2)', border: '2px solid var(--ink)', borderRadius: '10px', padding: '8px 12px', fontSize: '0.82rem' }}>
                🧩 <strong>Pattern Panic:</strong> Spot missing elements in number and shape patterns!
              </div>
              <div style={{ background: 'var(--surface-2)', border: '2px solid var(--ink)', borderRadius: '10px', padding: '8px 12px', fontSize: '0.82rem' }}>
                🏆 <strong>Challenge Tower:</strong> Play all three games to unlock the 4-floor summit!
              </div>
            </div>

            <button
              type="button"
              className="btn-primary"
              style={{ width: '100%', marginTop: '8px', fontSize: '1.05rem' }}
              onClick={handleFinish}
            >
              <span>LET'S PLAY!</span>
              <Icon name="controller" size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
