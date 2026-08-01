import { VerifyOtpForm } from '../features/auth/presentation/components/VerifyOtpForm'
import { LoginHero } from '../features/auth/presentation/components/LoginHero'

type VerifyOtpPageProps = {
  email: string
  onVerifySuccess: () => void
}

function VerifyOtpPage({ email, onVerifySuccess }: VerifyOtpPageProps) {
  return (
    <main className="auth-page">
      <section className="auth-card" aria-label="Xác thực OTP">
        <LoginHero />
        <VerifyOtpForm email={email} onSuccess={onVerifySuccess} />
      </section>
    </main>
  )
}

export default VerifyOtpPage
