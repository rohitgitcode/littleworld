import Icon from '../common/Icons';

/**
 * RecentActivity Component
 * 
 * Displays arcade log events with clean vector icons.
 */
export default function RecentActivity({ activities = [] }) {
  return (
    <article className="recent-activity-card" aria-label="Recent Activity Log">
      <div className="activity-header">
        <h3 className="activity-title">
          <Icon name="controller" size={16} />
          <span>Recent Activity</span>
        </h3>
        <span className="badge-pill badge-purple">Live Feed</span>
      </div>

      <div className="activity-list">
        {activities.map((item) => (
          <div key={item.id} className="activity-item">
            <div className="activity-icon" aria-hidden="true">
              <Icon name={item.iconName || 'gamepad'} size={15} />
            </div>
            <div className="activity-details">
              <span className="activity-entry-title">{item.title}</span>
              <span className="activity-entry-desc">{item.detail}</span>
              <span className="activity-entry-time">{item.time}</span>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
