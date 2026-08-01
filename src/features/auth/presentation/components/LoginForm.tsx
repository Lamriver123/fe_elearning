import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { FormEvent } from 'react'
import { toast } from 'react-hot-toast'
import { ApiError } from '../../../../shared/lib/httpClient'
import { useAuth } from '../../application/useAuth'
import type { AuthSession } from '../../domain/auth.types'
import { BrandMark } from './BrandMark'
import { FormField } from './FormField'
import { PasswordField } from './PasswordField'

type LoginFormProps = {
  onSuccess: (session: AuthSession) => void
}

function getSubmitErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message
  }

  return 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra API và thử lại.'
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage(null)
    setIsSubmitting(true)

    try {
      const session = await login(
        {
          email: email.trim(),
          password,
        },
        remember,
      )

      toast.success('Đăng nhập thành công!')
      onSuccess(session)
    } catch (error) {
      const errorMsg = getSubmitErrorMessage(error)
      setErrorMessage(errorMsg)
      toast.error(errorMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="login-panel">
      <div className="login-panel__header">
        <BrandMark />
        <h1>Chào mừng bạn quay lại!</h1>
        <p>Đăng nhập để tiếp tục hành trình học tập.</p>
      </div>

      <form className="login-form" onSubmit={handleSubmit}>
        <FormField
          id="email"
          label="Email"
          icon="person"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Nhập email của bạn"
          autoComplete="email"
          required
        />

        <PasswordField value={password} onChange={(event) => setPassword(event.target.value)} />

        <div className="login-form__options">
          <label className="remember-option">
            <input
              className="remember-option__input"
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
            />
            <span>Ghi nhớ đăng nhập</span>
          </label>

          <a className="text-link" href="#forgot-password">
            Quên mật khẩu?
          </a>
        </div>

        {errorMessage ? (
          <div className="form-alert" role="alert" aria-live="polite">
            <span className="material-symbols-outlined" aria-hidden="true">
              error
            </span>
            <span>{errorMessage}</span>
          </div>
        ) : null}

        <button className="primary-action" type="submit" disabled={isSubmitting}>
          <span>{isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}</span>
          <span className="material-symbols-outlined" aria-hidden="true">
            arrow_forward
          </span>
        </button>
      </form>

      <p className="login-panel__footer">
        Chưa có tài khoản?{' '}
        <Link className="text-link" to="/register">
          Đăng ký ngay
        </Link>
      </p>
    </div>
  )
}
