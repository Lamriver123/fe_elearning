import { RegisterForm } from '../features/auth/presentation/components/RegisterForm'
import { RegisterHero } from '../features/auth/presentation/components/RegisterHero'

type RegisterPageProps = {
  onRegisterSuccess: (email: string) => void
}

function RegisterPage({ onRegisterSuccess }: RegisterPageProps) {
  return (
    <main className="auth-page">
      <section className="auth-card auth-card--large" aria-label="Đăng ký">
        <RegisterHero />
        <RegisterForm onSuccess={onRegisterSuccess} />
      </section>
    </main>
  )
}

export default RegisterPage
