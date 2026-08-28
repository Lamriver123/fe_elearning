import { useState } from 'react'
import type { ReactNode } from 'react'
import type { AuthUser } from '../../../auth/domain/auth.types'
import { TeacherSidebar } from './TeacherSidebar'
import { TeacherHeader } from './TeacherHeader'
import '../styles/teacher-dashboard.css'

type TeacherLayoutProps = {
  children: ReactNode
  user: AuthUser
}

export function TeacherLayout({ children, user }: TeacherLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="teacher-dashboard">
      <TeacherHeader user={user} onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className={`teacher-sidebar-container ${isSidebarOpen ? 'open' : ''}`}>
        {isSidebarOpen && (
          <div className="teacher-sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />
        )}
        <TeacherSidebar />
      </div>
      
      <main className="teacher-main">
        {children}
      </main>
    </div>
  )
}
