import { useState } from 'react';
import Icon from '../components/common/Icons';
import { useProgress } from '../progression/store.jsx';

/**
 * SettingsPage (Arcade Settings & Preferences)
 * 
 * Clean vector-based settings toggles for audio, visuals, and data.
 */
export default function SettingsPage({ onNotify }) {
  const { resetProgress } = useProgress();
  const [soundEffects, setSoundEffects] = useState(true);
  const [backgroundMusic, setBackgroundMusic] = useState(true);
  const [highGlow, setHighGlow] = useState(true);
  const [screenShake, setScreenShake] = useState(false);

  const handleResetData = () => {
    resetProgress();
    onNotify(
      'Progress Reset',
      'All local progression restored to default values.'
    );
  };

  return (
    <div className="settings-page-container">
      <div className="page-header">
        <h1 className="page-title">
          <Icon name="gear" size={24} />
          <span>Arcade Settings</span>
        </h1>
        <p className="page-subtitle">
          Configure arcade audio, visual feedback, and interface preferences.
        </p>
      </div>

      <div className="settings-container">
        <section className="settings-card" aria-label="Audio Settings">
          <div className="settings-card-header">
            <Icon name="volume" size={17} />
            <span>Audio & Music</span>
          </div>

          <div className="settings-row">
            <div className="settings-info">
              <span className="settings-label">Sound Effects (SFX)</span>
              <span className="settings-hint">Play tactile arcade clicks and feedback tones</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={soundEffects}
                onChange={(e) => {
                  setSoundEffects(e.target.checked);
                  onNotify('Audio', `Sound effects ${e.target.checked ? 'enabled' : 'disabled'}`);
                }}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="settings-row">
            <div className="settings-info">
              <span className="settings-label">Background Music (BGM)</span>
              <span className="settings-hint">Play retro synthwave chiptune arcade tracks</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={backgroundMusic}
                onChange={(e) => {
                  setBackgroundMusic(e.target.checked);
                  onNotify('BGM', `Arcade music ${e.target.checked ? 'enabled' : 'disabled'}`);
                }}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </section>

        <section className="settings-card" aria-label="Visual Effects">
          <div className="settings-card-header">
            <Icon name="sparkle" size={17} />
            <span>Display & Visual Effects</span>
          </div>

          <div className="settings-row">
            <div className="settings-info">
              <span className="settings-label">Neon Accent Highlights</span>
              <span className="settings-hint">Enable subtle accent highlights on interactive cards</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={highGlow}
                onChange={(e) => {
                  setHighGlow(e.target.checked);
                  onNotify('Visuals', `Accent highlights ${e.target.checked ? 'enhanced' : 'standard'}`);
                }}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="settings-row">
            <div className="settings-info">
              <span className="settings-label">Screen Shake Dynamics</span>
              <span className="settings-hint">Dynamic micro-vibrations on combo strikes</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={screenShake}
                onChange={(e) => {
                  setScreenShake(e.target.checked);
                  onNotify('Effects', `Screen shake ${e.target.checked ? 'active' : 'inactive'}`);
                }}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </section>

        <section className="settings-card" aria-label="System Diagnostics">
          <div className="settings-card-header">
            <Icon name="controller" size={17} />
            <span>Game Data & Diagnostics</span>
          </div>

          <div className="settings-row">
            <div className="settings-info">
              <span className="settings-label">Reset Local Progress</span>
              <span className="settings-hint">Clear temporary challenge scores and restore defaults</span>
            </div>
            <button
              type="button"
              className="btn-arcade secondary"
              style={{ borderColor: 'rgba(244, 63, 133, 0.35)', color: 'var(--neon-pink)' }}
              onClick={handleResetData}
            >
              Reset Data
            </button>
          </div>

          <div style={{ paddingTop: '10px', borderTop: '1px solid var(--border-subtle)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <div>Engine: Pixarcade • React + Vite v8.3</div>
            <div>Build: Step 3 — Visual Polish + Memory Maze & Pattern Panic</div>
          </div>
        </section>
      </div>
    </div>
  );
}
