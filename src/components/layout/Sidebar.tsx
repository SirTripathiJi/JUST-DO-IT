import {
  Sparkles, Calendar, CheckSquare, Flame, Droplets,
  Pill, Dumbbell, HeartHandshake, Target, GraduationCap,
  Briefcase, Palette, BarChart3, Settings, Zap, User,
  Image as ImageIcon,
} from 'lucide-react'
import type { ModuleId, NavigationItem } from '../../types'
import { navigationItems } from '../../data/seedData'
import { useApp } from '../../context/AppContext'

const ICON_MAP: Record<string, React.ElementType> = {
  Sparkles, Calendar, CheckSquare, Flame, Droplets, Pill,
  Dumbbell, HeartHandshake, Target, GraduationCap, Briefcase,
  Palette, BarChart3, Settings, User,
  Image: ImageIcon,
}

export const Sidebar: React.FC = () => {
  const { activeModule, setActiveModule, isSidebarOpen, setSidebarOpen, profile, metrics, inspirationImages } = useApp()

  const handleNav = (id: ModuleId) => {
    setActiveModule(id)
    setSidebarOpen(false)
  }

  const groups: Array<{ key: NavigationItem['group']; title: string }> = [
    { key: 'overview', title: 'Overview' },
    { key: 'daily', title: 'Daily' },
    { key: 'wellness', title: 'Wellness' },
    { key: 'growth', title: 'Growth' },
    { key: 'system', title: 'System' },
  ]

  return (
    <>
      <aside
        className={`app-sidebar ${isSidebarOpen ? 'app-sidebar--open' : ''}`}
        aria-label="Navigation"
      >
        {/* Brand */}
        <div
          className="sidebar-brand"
          onClick={() => handleNav('today')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleNav('today')}
        >
          <div className="sidebar-brand__icon">
            <Zap size={14} strokeWidth={2.5} />
          </div>
          <span className="sidebar-brand__name">Just Do It</span>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {groups.map((g) => {
            const items = navigationItems.filter((n) => n.group === g.key)
            if (!items.length) return null

            return (
              <div key={g.key} className="sidebar-section">
                <div className="sidebar-section__label">{g.title}</div>
                {items.map((item) => {
                  const Icon = ICON_MAP[item.iconName] || Sparkles
                  const isActive = activeModule === item.id

                  // Live count badge for tasks or inspiration
                  const count =
                    item.id === 'tasks'
                      ? metrics.totalTasks - metrics.tasksCompleted || undefined
                      : item.id === 'inspiration'
                      ? inspirationImages.length || undefined
                      : undefined

                  return (
                    <button
                      key={item.id}
                      className={`sidebar-item ${isActive ? 'sidebar-item--active' : ''}`}
                      onClick={() => handleNav(item.id)}
                      title={item.description}
                    >
                      <Icon size={15} strokeWidth={1.8} className="sidebar-item__icon" />
                      <span style={{ flex: 1 }}>{item.label}</span>
                      {count !== undefined && count > 0 && (
                        <span className="sidebar-item__count">{count}</span>
                      )}
                    </button>
                  )
                })}
              </div>
            )
          })}
        </nav>

        {/* User */}
        <div className="sidebar-footer">
          <div
            className="sidebar-user"
            onClick={() => handleNav('profile')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleNav('profile')}
            style={{ cursor: 'pointer' }}
            title="View Profile & Accounts"
          >
            <div
              className="sidebar-user__avatar"
              style={profile.avatarColor ? { background: profile.avatarColor, color: '#ffffff' } : undefined}
            >
              {profile.avatarInitials}
            </div>
            <span className="sidebar-user__name">{profile.name.split(' ')[0] || 'User'}</span>
            <span className="sidebar-user__streak">{profile.streakScore || 0}d</span>
          </div>
        </div>
      </aside>

      {/* Backdrop */}
      <div
        className={`mobile-drawer-overlay ${isSidebarOpen ? 'mobile-drawer-overlay--open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />
    </>
  )
}
