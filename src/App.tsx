import React from 'react'
import { ThemeProvider } from './context/ThemeContext'
import { AppProvider, useApp } from './context/AppContext'
import { AppShell } from './components/layout/AppShell'

// Modules
import { TodayDashboard } from './modules/today/TodayDashboard'
import { TasksModule } from './modules/tasks/TasksModule'
import { HabitsModule } from './modules/habits/HabitsModule'
import { AcademicsModule } from './modules/academics/AcademicsModule'
import { CareerModule } from './modules/career/CareerModule'
import { FitnessModule } from './modules/fitness/FitnessModule'
import { SelfCareModule } from './modules/selfcare/SelfCareModule'
import { GoalsModule } from './modules/goals/GoalsModule'
import { WaterModule } from './modules/water/WaterModule'
import { SupplementsModule } from './modules/supplements/SupplementsModule'
import { HobbiesModule } from './modules/hobbies/HobbiesModule'
import { AnalyticsModule } from './modules/analytics/AnalyticsModule'
import { CalendarModule } from './modules/calendar/CalendarModule'
import { InspirationModule } from './modules/inspiration/InspirationModule'
import { SettingsModule } from './modules/settings/SettingsModule'
import { ProfileModule } from './modules/profile/ProfileModule'

// Global UI / Modals / Toasts
import { LoginView } from './components/auth/LoginView'
import { OnboardingModal } from './components/onboarding/OnboardingModal'
import { CommandPalette } from './components/ui/CommandPalette'
import { ContextualModalManager } from './components/modals/ContextualModalManager'
import { Toast } from './components/ui/Toast'

const MainRouter: React.FC = () => {
  const { activeModule, activeUserId, authStatus } = useApp()

  if (authStatus === 'loading') {
    return (
      <div role="status" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: 'var(--color-text-secondary)' }}>
        Restoring your secure session…
      </div>
    )
  }

  if (!activeUserId) {
    return <LoginView />
  }

  const renderModule = () => {
    switch (activeModule) {
      case 'today':
        return <TodayDashboard />
      case 'tasks':
        return <TasksModule />
      case 'habits':
        return <HabitsModule />
      case 'academics':
        return <AcademicsModule />
      case 'career':
        return <CareerModule />
      case 'workouts':
        return <FitnessModule />
      case 'selfcare':
        return <SelfCareModule />
      case 'goals':
        return <GoalsModule />
      case 'water':
        return <WaterModule />
      case 'supplements':
        return <SupplementsModule />
      case 'hobbies':
        return <HobbiesModule />
      case 'analytics':
        return <AnalyticsModule />
      case 'calendar':
        return <CalendarModule />
      case 'inspiration':
        return <InspirationModule />
      case 'settings':
        return <SettingsModule />
      case 'profile':
        return <ProfileModule />
      default:
        return <TodayDashboard />
    }
  }

  return (
    <AppShell>
      {renderModule()}
      <OnboardingModal />
      <CommandPalette />
      <ContextualModalManager />
      <Toast />
    </AppShell>
  )
}

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppProvider>
        <MainRouter />
      </AppProvider>
    </ThemeProvider>
  )
}

export default App
