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
  return (
    <div className="student-dashboard">
      <StudentSidebar onLogout={onLogout} />
      
      <div className="student-main-wrapper">
        <StudentHeader user={user} />
        
        <main className="student-content">
          <div className="student-content__container">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
