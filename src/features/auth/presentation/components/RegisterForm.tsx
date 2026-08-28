import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { FormEvent } from 'react'
import { toast } from 'react-hot-toast'
import { ApiError } from '../../../../shared/lib/httpClient'
import { registerAccount } from '../../application/authUseCases'
import { USER_ROLES, type UserRole } from '../../../../shared/constants/roles'
import { FormField } from './FormField'
import { PasswordField } from './PasswordField'

type RegisterFormProps = {
  onSuccess: (email: string) => void
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [role, setRole] = useState<UserRole>(USER_ROLES.STUDENT)
  const [userName, setUserName] = useState('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE')
  const [address, setAddress] = useState('')

  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage(null)
    setIsSubmitting(true)

    if (password !== confirmPassword) {
      setErrorMessage('Mật khẩu nhập lại không khớp')
      setIsSubmitting(false)
      return
    }

    try {
      await registerAccount({
        userName: userName.trim(),
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        phone: phone.trim() || undefined,
        dateOfBirth: dateOfBirth || undefined,
        gender,
        address: address.trim() || undefined,
        role,
      })

      toast.success('Đăng ký thành công! Vui lòng xác thực mã OTP.')
      onSuccess(email.trim())
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message)
        toast.error(error.message)
      } else {
        setErrorMessage('Không thể kết nối đến máy chủ. Vui lòng kiểm tra API và thử lại.')
        toast.error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra API và thử lại.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="login-panel login-panel--scrollable">
      <div className="login-panel__header">
        <h1>Đăng ký tài khoản</h1>
        <p>Điền thông tin dưới đây để tạo tài khoản mới.</p>
      </div>

      <div className="role-selector">
        <div className={`role-selector__slider ${role === USER_ROLES.STUDENT ? 'role-selector__slider--right' : ''}`} />
        <button
          type="button"
          className={`role-selector__btn ${role === USER_ROLES.TEACHER ? 'role-selector__btn--active' : ''}`}
          onClick={() => setRole(USER_ROLES.TEACHER)}
        >
          Giáo viên
        </button>
        <button
          type="button"
          className={`role-selector__btn ${role === USER_ROLES.STUDENT ? 'role-selector__btn--active' : ''}`}
          onClick={() => setRole(USER_ROLES.STUDENT)}
        >
          Học sinh
        </button>
      </div>

      <form className="login-form" onSubmit={handleSubmit}>
        <FormField
          id="fullName"
          label="Họ và tên"
          icon="badge"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Nhập họ và tên"
          required
        />

        <div className="form-row">
          <FormField
            id="userName"
            label="Tên người dùng"
            icon="person"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Nhập tên người dùng"
            required
          />
          <FormField
            id="phone"
            label="Số điện thoại"
            icon="call"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Nhập số điện thoại"
          />
        </div>

        <div className="form-row">
          <div className="form-field">
            <label className="form-field__label" htmlFor="dateOfBirth">Ngày sinh</label>
            <div className="form-field__control">
              <span className="material-symbols-outlined form-field__icon" aria-hidden="true">calendar_today</span>
              <input
                id="dateOfBirth"
                type="date"
                className="form-field__input"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
              />
            </div>
          </div>
          <div className="form-field">
            <label className="form-field__label">Giới tính</label>
            <div className="gender-options">
              <label className="gender-option">
                <input
                  type="radio"
                  name="gender"
                  value="MALE"
                  checked={gender === 'MALE'}
                  onChange={() => setGender('MALE')}
                />
                <span>Nam</span>
              </label>
              <label className="gender-option">
                <input
                  type="radio"
                  name="gender"
                  value="FEMALE"
                  checked={gender === 'FEMALE'}
                  onChange={() => setGender('FEMALE')}
                />
                <span>Nữ</span>
              </label>
              <label className="gender-option">
                <input
                  type="radio"
                  name="gender"
                  value="OTHER"
                  checked={gender === 'OTHER'}
                  onChange={() => setGender('OTHER')}
                />
                <span>Khác</span>
              </label>
            </div>
          </div>
        </div>

        <FormField
          id="email"
          label="Email"
          icon="mail"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Nhập địa chỉ email"
          required
        />

        <div className="form-row">
          <PasswordField value={password} onChange={(e) => setPassword(e.target.value)} />
          <div className="form-field">
            <label className="form-field__label" htmlFor="confirmPassword">Nhập lại mật khẩu</label>
            <div className="form-field__control">
              <span className="material-symbols-outlined form-field__icon" aria-hidden="true">lock</span>
              <input
                id="confirmPassword"
                type="password"
                className="form-field__input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu"
                required
              />
            </div>
          </div>
        </div>

        <FormField
          id="address"
          label="Địa chỉ"
          icon="location_on"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Nhập địa chỉ của bạn"
        />

        {errorMessage && (
          <div className="form-alert" role="alert" aria-live="polite">
            <span className="material-symbols-outlined" aria-hidden="true">error</span>
            <span>{errorMessage}</span>
          </div>
        )}

        <button className="primary-action" type="submit" disabled={isSubmitting}>
          <span>{isSubmitting ? 'Đang đăng ký...' : 'Đăng ký'}</span>
          <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
        </button>
      </form>

      <p className="login-panel__footer">
        Đã có tài khoản?{' '}
        <Link className="text-link" to="/login">
          Đăng nhập
        </Link>
      </p>
    </div>
  )
}
