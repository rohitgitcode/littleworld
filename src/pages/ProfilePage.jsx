import { useState, useEffect } from 'react';
import Icon from '../components/common/Icons';
import { useProgress } from '../progression/store.jsx';
import { THEMES } from '../progression/rules';
import { setMuted, setHapticsEnabled, triggerHaptic } from '../utils/audio';

/**
 * ProfilePage (Player Profile & Progression)
 * 
 * Shows:
 * - Real player stats (Level, Rank, Total XP, Coins, Streak)
 * - Personal Bests (Reaction, Memory, Pattern, Tower)
 * - Cosmetic Themes unlock/shop system
 * - Audio & Haptic Settings
 * - PWA Install App prompt
 */
export default function ProfilePage({ onNotify }) {
  const { player, saveData, updatePlayer, updateSettings, buyTheme, selectTheme, resetProgress } = useProgress();
  const personaIcons = ['user', 'controller', 'bolt', 'brain', 'puzzle', 'tower', 'star', 'fire'];
  const [selectedAvatar, setSelectedAvatar] = useState(player?.avatar || 'user');
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(() => {
    return typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
  });

  // PWA Install prompt listener
  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        onNotify('App Installed', 'Pixarcade added to your home screen!');
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      onNotify('PWA Ready', 'To install on mobile, tap Share > Add to Home Screen');
    }
  };

  const handleSelectAvatar = (av) => {
    setSelectedAvatar(av);
    updatePlayer({ avatar: av });
    onNotify('Avatar Updated', `Selected active arcade persona`);
  };

  const handleThemeAction = (theme) => {
    const isUnlocked = saveData.cosmetics?.unlockedThemes?.includes(theme.id);
    if (isUnlocked) {
      selectTheme(theme.id);
      onNotify('Theme Activated', `Applied ${theme.name} palette`);
    } else {
      const res = buyTheme(theme.id);
      if (res.success) {
        onNotify('Theme Purchased', `Unlocked ${theme.name} for ${theme.cost} coins!`);
      } else {
        onNotify('Purchase Failed', res.reason || 'Insufficient coins');
      }
    }
  };

  const soundEnabled = saveData.settings?.sound ?? true;
  const hapticsEnabled = saveData.settings?.haptics ?? true;

  const handleToggleSound = () => {
    const next = !soundEnabled;
    updateSettings({ sound: next });
    setMuted(!next);
    onNotify('Sound SFX', next ? 'Sound effects enabled' : 'Sound muted');
  };

  const handleToggleHaptics = () => {
    const next = !hapticsEnabled;
    updateSettings({ haptics: next });
    setHapticsEnabled(next);
    if (next) triggerHaptic(20);
    onNotify('Haptic Feedback', next ? 'Tactile vibration enabled' : 'Vibration disabled');
  };

  const pbs = saveData.personalBests || {};
  const plays = saveData.plays || {};
  const streak = saveData.streak || {};
  const activeThemeId = saveData.cosmetics?.activeTheme || 'default';
  const unlockedThemes = saveData.cosmetics?.unlockedThemes || ['default'];

  return (
    <div className="profile-page-container">
      <div className="page-header">
        <h1 className="page-title">
          <Icon name="user" size={24} />
          <span>Player Profile</span>
        </h1>
        <p className="page-subtitle">
          Manage your arcade persona, inspect personal records, and configure visual themes.
        </p>
      </div>

      <div className="profile-layout-grid">
        {/* Left Column: Player Identity Card */}
        <div className="profile-card">
          <div className="profile-large-avatar" aria-hidden="true">
            <Icon name={selectedAvatar} size={36} />
          </div>

          <h2 className="profile-name">{player?.name || 'ArcadeRider'}</h2>
          
          <div className="profile-title-badge">
            <span className="badge-pill badge-yellow">
              {player?.title || 'Novice'}
            </span>
          </div>

          {/* Quick Avatar Selector */}
          <div style={{ marginTop: '6px', textAlign: 'center' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--muted)' }}>
              CHOOSE PERSONA ICON
            </span>
            <div className="profile-avatar-selector">
              {personaIcons.map((iconName) => (
                <button
                  key={iconName}
                  type="button"
                  className={`avatar-choice-btn ${
                    selectedAvatar === iconName ? 'active' : ''
                  }`}
                  onClick={() => handleSelectAvatar(iconName)}
                  title={`Select ${iconName}`}
                >
                  <Icon name={iconName} size={16} />
                </button>
              ))}
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="profile-quick-stats">
            <div className="profile-stat-box">
              <div className="profile-stat-val">LVL {player?.level || 1}</div>
              <div className="profile-stat-lbl">Challenger Tier</div>
            </div>
            <div className="profile-stat-box">
              <div className="profile-stat-val">{player?.coins || 0}</div>
              <div className="profile-stat-lbl">Arcade Coins</div>
            </div>
          </div>

          {/* Streak Banner */}
          <div
            style={{
              marginTop: '12px',
              padding: '12px',
              background: 'var(--bg)',
              border: '2px solid var(--ink)',
              boxShadow: '2px 2px 0 var(--ink)',
              borderRadius: 'var(--radius-md)',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-around',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Icon name="fire" size={18} color="var(--tomato)" />
              <span style={{ fontSize: '0.85rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
                {streak.current || 0} Day Streak
              </span>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)' }}>
              Best: {streak.best || 0}d
            </span>
          </div>
        </div>

        {/* Right Column: Career Details & Personal Bests */}
        <div className="profile-details-card">
          <div>
            <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)', fontWeight: 800, marginBottom: '4px', color: 'var(--ink)' }}>
              Personal Bests & Career Records
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
              Real-time records tracked across all arcade games.
            </p>
          </div>

          <div className="career-stats-grid">
            <div className="career-stat-item">
              <div className="icon" style={{ background: 'var(--tomato)', color: 'var(--ink)' }}>
                <Icon name="bolt" size={18} />
              </div>
              <div>
                <div className="num">{pbs['reaction-reactor']?.score || 0} pts</div>
                <div className="desc">
                  Reaction PB ({pbs['reaction-reactor']?.bestRt || '--'}ms) • {plays['reaction-reactor'] || 0} runs
                </div>
              </div>
            </div>

            <div className="career-stat-item">
              <div className="icon" style={{ background: 'var(--teal)', color: 'var(--ink)' }}>
                <Icon name="brain" size={18} />
              </div>
              <div>
                <div className="num">{pbs['memory-maze']?.score || 0} pts</div>
                <div className="desc">
                  Memory PB (Round {pbs['memory-maze']?.level || 0}) • {plays['memory-maze'] || 0} runs
                </div>
              </div>
            </div>

            <div className="career-stat-item">
              <div className="icon" style={{ background: 'var(--violet)', color: 'var(--ink)' }}>
                <Icon name="puzzle" size={18} />
              </div>
              <div>
                <div className="num">{pbs['pattern-panic']?.score || 0} pts</div>
                <div className="desc">
                  Pattern PB ({pbs['pattern-panic']?.correct || 0} correct) • {plays['pattern-panic'] || 0} runs
                </div>
              </div>
            </div>

            <div className="career-stat-item">
              <div className="icon" style={{ background: 'var(--sun)', color: 'var(--ink)' }}>
                <Icon name="trophy" size={18} />
              </div>
              <div>
                <div className="num">{saveData.gamesPlayed || 0}</div>
                <div className="desc">Total Matches Completed</div>
              </div>
            </div>
          </div>

          {/* Cosmetics Theme Unlock Section */}
          <div style={{ marginTop: '8px', paddingTop: '16px', borderTop: '2px solid var(--ink)' }}>
            <h4 style={{ fontSize: '1rem', fontFamily: 'var(--font-display)', fontWeight: 800, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--ink)' }}>
              <Icon name="sparkle" size={16} />
              <span>Theme Shop</span>
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
              {THEMES.map((theme) => {
                const isUnlocked = unlockedThemes.includes(theme.id);
                const isActive = activeThemeId === theme.id;

                return (
                  <div
                    key={theme.id}
                    style={{
                      background: isActive ? 'var(--sun)' : 'var(--surface)',
                      border: '3px solid var(--ink)',
                      boxShadow: isActive ? '2px 2px 0 var(--ink)' : '4px 4px 0 var(--ink)',
                      borderRadius: 'var(--radius-md)',
                      padding: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      transform: isActive ? 'translate(2px, 2px)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
                        {theme.name}
                      </span>
                      <span
                        style={{
                          width: '14px',
                          height: '14px',
                          borderRadius: '50%',
                          background: theme.previewColor,
                          border: '2px solid var(--ink)',
                        }}
                      />
                    </div>
                    <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--muted)' }}>
                      {theme.cost === 0 ? 'Free' : `${theme.cost} Coins`}
                    </span>

                    <button
                      type="button"
                      className={`btn-${isActive ? 'secondary' : isUnlocked ? 'primary' : 'primary'}`}
                      style={{ padding: '6px 10px', fontSize: '0.78rem', marginTop: '4px', minHeight: '38px', width: '100%' }}
                      onClick={() => handleThemeAction(theme)}
                      disabled={isActive}
                    >
                      {isActive ? 'Active' : isUnlocked ? 'Select' : `Unlock`}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Settings Section inside Profile */}
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '2px solid var(--ink)' }}>
            <h4 style={{ fontSize: '1rem', fontFamily: 'var(--font-display)', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--ink)' }}>
              <Icon name="gear" size={16} />
              <span>Game Settings & Preferences</span>
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Sound Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg)', border: '2px solid var(--ink)', boxShadow: '2px 2px 0 var(--ink)', padding: '10px 14px', borderRadius: '12px' }}>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>Sound Effects (SFX)</div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--muted)' }}>WebAudio arcade synthesizer</div>
                </div>
                <button
                  type="button"
                  className={soundEnabled ? 'btn-primary' : 'btn-secondary'}
                  style={{ minHeight: '38px', padding: '6px 14px', fontSize: '0.82rem' }}
                  onClick={handleToggleSound}
                >
                  {soundEnabled ? 'ON' : 'MUTED'}
                </button>
              </div>

              {/* Haptics Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg)', border: '2px solid var(--ink)', boxShadow: '2px 2px 0 var(--ink)', padding: '10px 14px', borderRadius: '12px' }}>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>Tactile Haptics</div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--muted)' }}>Mobile vibration feedback on hits</div>
                </div>
                <button
                  type="button"
                  className={hapticsEnabled ? 'btn-primary' : 'btn-secondary'}
                  style={{ minHeight: '38px', padding: '6px 14px', fontSize: '0.82rem' }}
                  onClick={handleToggleHaptics}
                >
                  {hapticsEnabled ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* PWA App Install Button */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg)', border: '2px solid var(--ink)', boxShadow: '2px 2px 0 var(--ink)', padding: '10px 14px', borderRadius: '12px' }}>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>Install Arcade App</div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--muted)' }}>Fast offline play on phone or desktop</div>
                </div>
                <button
                  type="button"
                  className="btn-primary"
                  style={{ minHeight: '38px', padding: '6px 14px', fontSize: '0.82rem' }}
                  onClick={handleInstallApp}
                  disabled={isInstalled}
                >
                  {isInstalled ? 'Installed' : 'Install'}
                </button>
              </div>

              {/* Reset Progress */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg)', border: '2px solid var(--ink)', boxShadow: '2px 2px 0 var(--ink)', padding: '10px 14px', borderRadius: '12px' }}>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>Reset Progress</div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--muted)' }}>Restore default starter coins and stats</div>
                </div>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ minHeight: '38px', padding: '6px 14px', fontSize: '0.82rem', color: 'var(--tomato)' }}
                  onClick={() => {
                    if (window.confirm('Reset all arcade progression and achievements?')) {
                      resetProgress();
                      onNotify('Progress Reset', 'Default arcade state restored.');
                    }
                  }}
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Creator Credit */}
      <footer
        className="profile-creator-credit"
        style={{
          textAlign: 'center',
          fontSize: '14px',
          fontWeight: 700,
          color: 'var(--muted)',
          paddingTop: '20px',
          paddingBottom: '100px',
        }}
      >
        Made by Rohit
      </footer>
    </div>
  );
}
