import React from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { MobileNav } from './MobileNav'

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-main-wrapper">
        <Header />
        <main className="app-content" id="main-content">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  )
}
