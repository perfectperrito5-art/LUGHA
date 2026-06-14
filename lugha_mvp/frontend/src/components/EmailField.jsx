import { useMemo, useState } from 'react'
import { validateEmail } from '../utils/validateEmail.js'

export default function EmailField({ value, onChange, required }) {
  const [focused, setFocused] = useState(false)
  const touched = value.length > 0
  const check = useMemo(() => validateEmail(value), [value])
  const showError = touched && !check.ok && (value.includes('@') || value.length > 4)
  const showOk = touched && check.ok

  return (
    <div className={`form-row email-field ${showError ? 'has-error' : ''}`}>
      <label className="form-label" htmlFor="reg-email">Email</label>
      <input
        id="reg-email"
        className={`form-input ${showError ? 'input-invalid' : ''} ${showOk ? 'input-valid' : ''}`}
        type="email"
        inputMode="email"
        autoCapitalize="none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="you@gmail.com"
        required={required}
        autoComplete="email"
        aria-describedby="reg-email-hint"
      />
      {focused && !touched && (
        <p id="reg-email-hint" className="field-hint field-hint--focus">Use an inbox you check often</p>
      )}
      {showError && (
        <p className="field-feedback err">{check.message.split('—')[0].trim()}</p>
      )}
    </div>
  )
}
