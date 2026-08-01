import type { ChangeEvent, HTMLInputAutoCompleteAttribute, InputHTMLAttributes } from 'react'

type FormFieldProps = {
  id: string
  label: string
  icon: string
  value: string
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  autoComplete?: HTMLInputAutoCompleteAttribute
} & Pick<InputHTMLAttributes<HTMLInputElement>, 'type' | 'placeholder' | 'required'>

export function FormField({
  id,
  label,
  icon,
  value,
  onChange,
  autoComplete,
  type = 'text',
  placeholder,
  required,
}: FormFieldProps) {
  return (
    <div className="form-field">
      <label className="form-field__label" htmlFor={id}>
        {label}
      </label>
      <div className="form-field__control">
        <span className="material-symbols-outlined form-field__icon" aria-hidden="true">
          {icon}
        </span>
        <input
          id={id}
          className="form-field__input"
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
        />
      </div>
    </div>
  )
}
