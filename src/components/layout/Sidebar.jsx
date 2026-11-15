import Icon from '../common/Icons';

/**
 * Sidebar Component
 * 
 * Provides clean vector-icon navigation between application sections:
 * - Home (Dashboard)
 * - Explore World (Game Zones)
 * - Achievements (Trophy Hall)
 * - Profile (Player Persona)
 * - Settings (Preferences)
 */
export default function Sidebar({
  activePage,
  onNavigate,
  isMobileOpen,
  onCloseMobile,
}) {
  const navItems = [
    { id: 'home', label: 'Home', icon: 'home', badge: null },
    { id: 'world', label: 'Explore World', icon: 'map', badge: '4 Zones' },
    { id: 'achievements', label: 'Achievements', icon: 'trophy', badge: '1/6' },
    { id: 'profile', label: 'Profile', icon: 'profile', badge: null },
    { id: 'settings', label: 'Settings', icon: 'settings', badge: null },
  ];

  const handleNavClick = (pageId) => {
    onNavigate(pageId);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {isMobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
        <div
          className="sidebar-brand"
          onClick={() => handleNavClick('home')}
          title="Return to Home"
        >
          <div className="brand-icon-wrapper">
            <Icon name="controller" size={20} />
          </div>
          <div className="brand-text">
            <span className="brand-title">Little Big World</span>
            <span className="brand-subtitle">Arcade Edition</span>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Main Navigation">
          <div className="nav-section-label">Main Menu</div>
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => handleNavClick(item.id)}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="nav-icon">
                  <Icon name={item.icon} size={18} />
                </span>
                <span className="nav-label">{item.label}</span>
                {item.badge && (
                  <span className="nav-badge">{item.badge}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="system-status">
            <span className="status-dot" aria-hidden="true"></span>
            <span>Arcade Online</span>
          </div>
          <span className="app-version-pill">v0.3.0</span>
        </div>
      </aside>
    </>
  );
}
