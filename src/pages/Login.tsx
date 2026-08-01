import type { AuthSession } from '../features/auth/domain/auth.types'
import { LoginForm } from '../features/auth/presentation/components/LoginForm'
import { LoginHero } from '../features/auth/presentation/components/LoginHero'

type LoginPageProps = {
  onLoginSuccess: (session: AuthSession) => void
}

function LoginPage({ onLoginSuccess }: LoginPageProps) {
  return (
    <main className="auth-page">
      <section className="auth-card" aria-label="Đăng nhập">
        <LoginHero />
        <LoginForm onSuccess={onLoginSuccess} />
      </section>
    </main>
  )
}

export default LoginPage
