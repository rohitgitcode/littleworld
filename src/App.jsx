import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import Header from './components/layout/Header';
import HomePage from './pages/HomePage';
import WorldPage from './pages/WorldPage';
import AchievementsPage from './pages/AchievementsPage';
import ProfilePage from './pages/ProfilePage';
import OnboardingModal from './components/common/OnboardingModal';
import LevelUpOverlay from './components/common/LevelUpOverlay';
import Icon from './components/common/Icons';
import { useProgress } from './progression/store.jsx';
import { initAudio, setMuted, setHapticsEnabled } from './utils/audio';

// Lazy-loaded arcade games for code-splitting
const ReactionGame = lazy(() => import('./games/reaction/ReactionGame'));
const MemoryMazeGame = lazy(() => import('./games/memory/MemoryMazeGame'));
const PatternPanicGame = lazy(() => import('./games/pattern/PatternPanicGame'));
const ChallengeTowerGame = lazy(() => import('./games/tower/ChallengeTowerGame'));
const LaserMazeGame = lazy(() => import('./games/laser/LaserMazeGame'));

/**
 * Little Big World — Main Application Component (Mobile-First Arcade)
 */
export default function App() {
  const [activePage, setActivePage] = useState('home');
  const [activeGame, setActiveGame] = useState(null);
  const [toast, setToast] = useState(null);
  const [levelUpLevel, setLevelUpLevel] = useState(null);

  const { player, saveData, completeOnboarding } = useProgress();
  const prevLevelRef = useRef(player?.level);

  // Synchronize audio and haptics settings
  useEffect(() => {
    setMuted(!saveData.settings?.sound);
    setHapticsEnabled(saveData.settings?.haptics);
  }, [saveData.settings]);

  // Unlock AudioContext on first user interaction
  useEffect(() => {
    const unlockAudio = () => {
      initAudio();
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
    window.addEventListener('pointerdown', unlockAudio);
    window.addEventListener('keydown', unlockAudio);
    return () => {
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
  }, []);

  // Detect Level-Up to trigger modal overlay celebration
  useEffect(() => {
    if (player?.level && prevLevelRef.current && player.level > prevLevelRef.current) {
      setLevelUpLevel(player.level);
    }
    prevLevelRef.current = player?.level;
  }, [player?.level]);

  // Toast timer
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  const showToast = (title, message) => {
    setToast({ title, message });
  };

  const handleNavigate = (pageId) => {
    setActiveGame(null);
    setActivePage(pageId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLaunchGame = (gameId) => {
    setActiveGame(gameId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExitGame = () => {
    setActiveGame(null);
  };

  const renderCurrentPage = () => {
    if (activeGame === 'reaction-reactor') {
      return (
        <Suspense fallback={<div className="loading-fallback">Loading Reaction Reactor...</div>}>
          <ReactionGame onExit={handleExitGame} />
        </Suspense>
      );
    }
    if (activeGame === 'memory-maze') {
      return (
        <Suspense fallback={<div className="loading-fallback">Loading Memory Maze...</div>}>
          <MemoryMazeGame onExit={handleExitGame} />
        </Suspense>
      );
    }
    if (activeGame === 'pattern-panic') {
      return (
        <Suspense fallback={<div className="loading-fallback">Loading Pattern Panic...</div>}>
          <PatternPanicGame onExit={handleExitGame} />
        </Suspense>
      );
    }
    if (activeGame === 'challenge-tower' || activeGame === 'tower') {
      return (
        <Suspense fallback={<div className="loading-fallback">Loading Challenge Tower...</div>}>
          <ChallengeTowerGame onExit={handleExitGame} />
        </Suspense>
      );
    }
    if (activeGame === 'laser-maze' || activeGame === 'laser') {
      return (
        <Suspense fallback={<div className="loading-fallback">Loading Laser Maze...</div>}>
          <LaserMazeGame onExit={handleExitGame} />
        </Suspense>
      );
    }

    switch (activePage) {
      case 'home':
        return (
          <HomePage
            onNavigate={handleNavigate}
            onNotify={showToast}
            onLaunchGame={handleLaunchGame}
          />
        );
      case 'world':
        return (
          <WorldPage
            onNotify={showToast}
            onLaunchGame={handleLaunchGame}
          />
        );
      case 'achievements':
        return <AchievementsPage onNotify={showToast} />;
      case 'profile':
      case 'settings':
        return <ProfilePage onNotify={showToast} />;
      default:
        return (
          <HomePage
            onNavigate={handleNavigate}
            onNotify={showToast}
            onLaunchGame={handleLaunchGame}
          />
        );
    }
  };

  return (
    <div className="app-container">
      <div className="main-layout">
        {!activeGame && (
          <Header
            player={player}
            activePage={activePage}
            activeGame={activeGame}
            onNavigate={handleNavigate}
          />
        )}

        <main className="content-area">
          {renderCurrentPage()}
        </main>

        {!activeGame && (
          <nav className="mobile-bottom-nav" aria-label="Mobile Bottom Navigation">
            <button
              type="button"
              className={`bottom-nav-item ${activePage === 'home' ? 'active' : ''}`}
              onClick={() => handleNavigate('home')}
            >
              <span className="bottom-nav-icon"><Icon name="home" size={20} /></span>
              <span>Home</span>
            </button>
            <button
              type="button"
              className={`bottom-nav-item ${activePage === 'world' ? 'active' : ''}`}
              onClick={() => handleNavigate('world')}
            >
              <span className="bottom-nav-icon"><Icon name="map" size={20} /></span>
              <span>Play</span>
            </button>
            <button
              type="button"
              className={`bottom-nav-item ${activePage === 'achievements' ? 'active' : ''}`}
              onClick={() => handleNavigate('achievements')}
            >
              <span className="bottom-nav-icon"><Icon name="trophy" size={20} /></span>
              <span>Rewards</span>
            </button>
            <button
              type="button"
              className={`bottom-nav-item ${activePage === 'profile' || activePage === 'settings' ? 'active' : ''}`}
              onClick={() => handleNavigate('profile')}
            >
              <span className="bottom-nav-icon"><Icon name="user" size={20} /></span>
              <span>Profile</span>
            </button>
          </nav>
        )}
      </div>

      {/* Level-Up Celebration Modal */}
      {levelUpLevel && (
        <LevelUpOverlay
          level={levelUpLevel}
          onClose={() => setLevelUpLevel(null)}
        />
      )}

      {/* First-Run Onboarding Modal */}
      {saveData && !saveData.onboardingCompleted && (
        <OnboardingModal
          onComplete={completeOnboarding}
        />
      )}

      {/* In-game Toast Notification */}
      {toast && (
        <aside className="arcade-toast" role="status" aria-live="polite">
          <span className="arcade-toast-icon">
            <Icon name="bolt" size={16} />
          </span>
          <div className="arcade-toast-content">
            <div className="arcade-toast-title">{toast.title}</div>
            <div className="arcade-toast-desc">{toast.message}</div>
          </div>
          <button
            type="button"
            className="arcade-toast-close"
            onClick={() => setToast(null)}
            aria-label="Dismiss notification"
          >
            <Icon name="close" size={14} />
          </button>
        </aside>
      )}
    </div>
  );
}
