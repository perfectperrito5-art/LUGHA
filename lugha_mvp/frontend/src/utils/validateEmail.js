const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

export function validateEmail(value) {
  const v = (value || '').trim()
  if (!v) return { ok: false, message: 'Email is required.' }
  if (v.includes(' ')) return { ok: false, message: 'Email cannot contain spaces.' }
  if (!v.includes('@')) return { ok: false, message: 'Include @ between your name and provider (e.g. you@gmail.com).' }
  const [local, domain] = v.split('@')
  if (!local || !domain) return { ok: false, message: 'Enter both sides of @ — name and provider.' }
  if (!domain.includes('.')) return { ok: false, message: 'Add a domain extension like .com, .africa, or .org.' }
  if (!EMAIL_RE.test(v)) return { ok: false, message: 'That email format looks off. Try name@provider.com' }
  return { ok: true, message: 'Looks good — we\'ll use this for sign-in.' }
}
