import type { ReactNode } from 'react'
import type { AuthUser } from '../../../auth/domain/auth.types'
import { TeacherSidebar } from './TeacherSidebar'
import { TeacherHeader } from './TeacherHeader'
import '../styles/teacher-dashboard.css'

type TeacherLayoutProps = {
  children: ReactNode
  user: AuthUser
  onLogout: () => Promise<void>
}

export function TeacherLayout({ children, user, onLogout }: TeacherLayoutProps) {
  return (
    <div className="teacher-dashboard">
      <TeacherHeader user={user} />
      <TeacherSidebar onLogout={onLogout} />
      
      <main className="teacher-main">
        {children}
      </main>
    </div>
  )
}
