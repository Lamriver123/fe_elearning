import { useState } from 'react'
import type { ChangeEvent } from 'react'

type PasswordFieldProps = {
  value: string
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
}

export function PasswordField({ value, onChange }: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div className="form-field">
      <label className="form-field__label" htmlFor="password">
        Mật khẩu
      </label>
      <div className="form-field__control">
        <span className="material-symbols-outlined form-field__icon" aria-hidden="true">
          lock
        </span>
        <input
          id="password"
          className="form-field__input form-field__input--with-action"
          type={isVisible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder="Nhập mật khẩu"
          autoComplete="current-password"
          required
        />
        <button
          className="icon-button form-field__action"
          type="button"
          onClick={() => setIsVisible((current) => !current)}
          aria-label={isVisible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          title={isVisible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
        >
          <span className="material-symbols-outlined" aria-hidden="true">
            {isVisible ? 'visibility_off' : 'visibility'}
          </span>
        </button>
      </div>
    </div>
  )
}
