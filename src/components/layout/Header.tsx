import React from 'react'
import { Menu, Plus, Sun, Moon, Search } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useTheme } from '../../context/ThemeContext'
import { navigationItems } from '../../data/seedData'
import { Button } from '../ui/Button'

export const Header: React.FC = () => {
  const { activeModule, setActiveModule, setSidebarOpen, isSidebarOpen, openModal, profile } = useApp()
  const { resolvedTheme, toggleTheme } = useTheme()

  const current = navigationItems.find((n) => n.id === activeModule)

  const handleContextualAdd = () => {
    switch (activeModule) {
      case 'tasks':        openModal('task'); break
      case 'habits':       openModal('habit'); break
      case 'water':        openModal('water'); break
      case 'supplements':  openModal('supplement'); break
      case 'workouts':     openModal('workout'); break
      case 'selfcare':     openModal('selfcare'); break
      case 'academics':    openModal('lecture_sheet'); break
      case 'career':       openModal('career_roadmap'); break
      case 'goals':        openModal('goal'); break
      case 'hobbies':      openModal('hobby'); break
      default:             openModal('task'); break
    }
  }

  return (
    <header className="app-header">
      <div className="app-header__inner">
        <div className="app-header__left">
          <Button
            variant="ghost"
            size="sm"
            icon
            className="app-header__mobile-btn"
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            aria-label="Toggle sidebar"
          >
            <Menu size={18} />
          </Button>

          <span className="app-header__breadcrumb">
            {current?.label ?? 'Overview'}
          </span>
        </div>

        <div className="app-header__right">
          <button
            onClick={() => openModal('command_palette')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r-sm)',
              fontSize: '12px',
              color: 'var(--text-tertiary)',
              cursor: 'pointer',
              transition: 'border-color 80ms ease, color 80ms ease',
            }}
          >
            <Search size={13} />
            <span>Search</span>
            <kbd
              style={{
                padding: '1px 5px',
                fontSize: '10px',
                borderRadius: '3px',
                background: 'var(--bg-white)',
                border: '1px solid var(--border)',
                fontFamily: 'inherit',
                color: 'var(--text-tertiary)',
              }}
            >
              ⌘K
            </kbd>
          </button>

          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Plus size={14} />}
            onClick={handleContextualAdd}
          >
            New
          </Button>

          <Button
            variant="ghost"
            size="sm"
            icon
            onClick={toggleTheme}
            aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {resolvedTheme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </Button>

          <button
            onClick={() => setActiveModule('profile')}
            title={`Profile & Accounts (${profile.name})`}
            aria-label="Profile & Accounts"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              background: 'var(--text-primary)',
              color: 'var(--bg-white)',
              fontSize: '10px',
              fontWeight: 700,
              border: activeModule === 'profile'
                ? '2px solid var(--border-strong)'
                : '1.5px solid var(--border)',
              cursor: 'pointer',
              marginLeft: '2px',
              transition: 'opacity 100ms ease',
              letterSpacing: '0',
              flexShrink: 0,
            }}
          >
            {profile.avatarInitials}
          </button>
        </div>
      </div>
    </header>
  )
}
