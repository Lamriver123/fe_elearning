import { useState, useEffect, useRef, type FormEvent, type KeyboardEvent, type ClipboardEvent } from 'react'
import { toast } from 'react-hot-toast'
import { ApiError } from '../../../../shared/lib/httpClient'
import { resendAccountOtp, verifyAccountOtp } from '../../application/authUseCases'

type VerifyOtpFormProps = {
  email: string
  onSuccess: () => void
}

export function VerifyOtpForm({ email, onSuccess }: VerifyOtpFormProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [resendMessage, setResendMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [timeLeft, setTimeLeft] = useState(60)
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (timeLeft <= 0) return
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [timeLeft])

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return // Only digits allowed

    const newOtp = [...otp]
    // Get the last character entered
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)

    // Move to next input if value is entered
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Move to previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pastedData) return

    const newOtp = [...otp]
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i]
    }
    setOtp(newOtp)
    
    // Focus the next empty input or the last one
    const nextIndex = Math.min(pastedData.length, 5)
    inputRefs.current[nextIndex]?.focus()
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const otpValue = otp.join('')
    if (otpValue.length < 6) {
      setErrorMessage('Vui lòng nhập đủ 6 chữ số')
      return
    }

    setErrorMessage(null)
    setResendMessage(null)
    setIsSubmitting(true)

    try {
      await verifyAccountOtp({
        email,
        otp: otpValue,
      })

      toast.success('Xác thực tài khoản thành công!')
      onSuccess()
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message)
        toast.error(error.message)
      } else {
        setErrorMessage('Không thể xác thực OTP. Vui lòng kiểm tra lại.')
        toast.error('Không thể xác thực OTP. Vui lòng kiểm tra lại.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleResendOtp() {
    setErrorMessage(null)
    setResendMessage(null)
    try {
      await resendAccountOtp({ email })
      setResendMessage('Mã OTP mới đã được gửi.')
      toast.success('Mã OTP mới đã được gửi.')
      setTimeLeft(60)
    } catch (error) {
       if (error instanceof ApiError) {
        setErrorMessage(error.message)
        toast.error(error.message)
      } else {
        setErrorMessage('Không thể gửi lại OTP. Vui lòng thử lại.')
        toast.error('Không thể gửi lại OTP. Vui lòng thử lại.')
      }
    }
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="login-panel">
      <div className="login-panel__header">
        <h1>Xác thực tài khoản</h1>
        <p>Vui lòng nhập mã OTP đã được gửi đến email <strong>{email}</strong>.</p>
      </div>

      <form className="login-form" onSubmit={handleSubmit}>
        <div className="otp-inputs">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className="otp-input"
              aria-label={`Chữ số OTP ${index + 1}`}
            />
          ))}
        </div>

        {errorMessage && (
          <div className="form-alert" role="alert" aria-live="polite">
            <span className="material-symbols-outlined" aria-hidden="true">
              error
            </span>
            <span>{errorMessage}</span>
          </div>
        )}
        
        {resendMessage && (
          <div className="form-alert form-alert--info" role="alert" aria-live="polite">
            <span className="material-symbols-outlined" aria-hidden="true">
              info
            </span>
            <span>{resendMessage}</span>
          </div>
        )}

        <button className="primary-action" type="submit" disabled={isSubmitting || otp.join('').length < 6}>
          <span>{isSubmitting ? 'Đang xác thực...' : 'Xác nhận OTP'}</span>
          <span className="material-symbols-outlined" aria-hidden="true">
            check_circle
          </span>
        </button>
        
        <div className="otp-resend">
          {timeLeft > 0 ? (
            <p>
              Bạn có thể yêu cầu gửi lại sau <strong>{formatTime(timeLeft)}</strong>
            </p>
          ) : (
            <button 
              type="button" 
              onClick={handleResendOtp}
              className="otp-resend__button"
            >
              Gửi lại OTP
            </button>
          )}
        </div>
      </form>

      <p className="login-panel__footer">
        Quay lại <a className="text-link" href="/login">Đăng nhập</a>
      </p>
    </div>
  )
}
