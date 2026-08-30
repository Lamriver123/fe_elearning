import { useState } from 'react'
import type { ReactNode } from 'react'
import { type AuthUser } from '../../../auth/domain/auth.types'
import { StudentSidebar } from './StudentSidebar'
import { StudentHeader } from './StudentHeader'
import '../styles/student-dashboard.css'
import '../styles/student-theme.css'
import '../styles/student-home-refresh.css'
import '../styles/student-learning-refresh.css'
import '../styles/student-liquid-base.css'
import '../styles/student-liquid-shell.css'
import '../styles/student-liquid-learning.css'
import '../styles/student-liquid-exams.css'

type StudentLayoutProps = {
  user: AuthUser
  children: ReactNode
}

export function StudentLayout({ user, children }: StudentLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="student-dashboard">
      <div className="student-dashboard__backdrop" aria-hidden="true" />
      <div className={`student-sidebar-container ${isSidebarOpen ? 'open' : ''}`}>
        {isSidebarOpen && (
          <div className="student-sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />
        )}
        <StudentSidebar />
      </div>
      
      <div className="student-main-wrapper">
        <StudentHeader user={user} onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        
        <main className="student-content">
          <div className="student-content__container">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
