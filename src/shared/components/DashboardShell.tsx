import type { ReactNode } from 'react'
import type { AuthUser } from '../../features/auth/domain/auth.types'

type DashboardShellProps = {
  user: AuthUser
  title: string
  description: string
  badge: string
  children: ReactNode
  onLogout: () => Promise<void>
}

export function DashboardShell({
  user,
  title,
  description,
  badge,
  children,
  onLogout,
}: DashboardShellProps) {
  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div className="dashboard-header__identity">
          <img className="dashboard-header__avatar" src={user.avatar ?? ''} alt={user.fullName} />
          <div>
            <span className="dashboard-header__badge">{badge}</span>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
        </div>

        <button className="secondary-action" type="button" onClick={() => void onLogout()}>
          <span className="material-symbols-outlined" aria-hidden="true">
            logout
          </span>
          <span>Đăng xuất</span>
        </button>
      </header>

      <section className="dashboard-content">{children}</section>
    </main>
  )
}
