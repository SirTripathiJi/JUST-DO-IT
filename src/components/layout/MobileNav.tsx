import React from 'react'
import { Sparkles, CheckSquare, Flame, Droplets, Calendar } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import type { ModuleId } from '../../types'

export const MobileNav: React.FC = () => {
  const { activeModule, setActiveModule } = useApp()

  const tabs: Array<{ id: ModuleId; label: string; Icon: React.ElementType }> = [
    { id: 'today',    label: 'Today',   Icon: Sparkles    },
    { id: 'tasks',    label: 'Tasks',   Icon: CheckSquare },
    { id: 'habits',   label: 'Habits',  Icon: Flame       },
    { id: 'water',    label: 'Water',   Icon: Droplets    },
    { id: 'calendar', label: 'Calendar',Icon: Calendar    },
  ]

  return (
    <nav className="mobile-nav" aria-label="Mobile navigation">
      {tabs.map(({ id, label, Icon }) => (
        <button
          key={id}
          className={`mobile-nav__btn ${activeModule === id ? 'mobile-nav__btn--active' : ''}`}
          onClick={() => setActiveModule(id)}
        >
          <Icon size={20} strokeWidth={1.8} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  )
}
