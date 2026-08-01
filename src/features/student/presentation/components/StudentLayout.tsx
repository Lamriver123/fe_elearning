import { useState } from 'react'
import type { ReactNode } from 'react'
import { type AuthUser } from '../../../auth/domain/auth.types'
import { StudentSidebar } from './StudentSidebar'
import { StudentHeader } from './StudentHeader'
import '../styles/student-dashboard.css'

type StudentLayoutProps = {
  user: AuthUser
  onLogout: () => Promise<void>
  children: ReactNode
}

export function StudentLayout({ user, onLogout, children }: StudentLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="student-dashboard">
      <div className={`student-sidebar-container ${isSidebarOpen ? 'open' : ''}`}>
        {isSidebarOpen && (
          <div className="student-sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />
        )}
        <StudentSidebar onLogout={onLogout} />
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
