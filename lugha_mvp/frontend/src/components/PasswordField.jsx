import { useMemo, useState } from 'react'
import { scorePassword } from '../utils/passwordStrength.js'

const LEVEL_CLASS = {
  Weak: 'pw-weak',
  Strong: 'pw-strong',
  Stronger: 'pw-stronger',
  Strongest: 'pw-strongest',
}

export default function PasswordField({ value, onChange, required }) {
  const [focused, setFocused] = useState(false)
  const analysis = useMemo(() => scorePassword(value), [value])
  const pct = value ? (analysis.score / 4) * 100 : 0
  const showMeter = value.length > 0

  return (
    <div className="form-row pw-field">
      <label className="form-label" htmlFor="reg-password">Password</label>
      <input
        id="reg-password"
        className="form-input"
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="8+ chars · mix letters & numbers"
        minLength={8}
        required={required}
        autoComplete="new-password"
      />
      {focused && !value && (
        <p className="field-hint field-hint--focus">Add a number or symbol to strengthen it</p>
      )}
      {showMeter && (
        <div className="pw-compact" aria-live="polite">
          <div className="pw-meter" aria-hidden>
            <div className={`pw-meter-fill ${LEVEL_CLASS[analysis.label]}`} style={{ width: `${pct}%` }} />
          </div>
          <span className={`pw-label ${LEVEL_CLASS[analysis.label]}`}>{analysis.label}</span>
        </div>
      )}
    </div>
  )
}
