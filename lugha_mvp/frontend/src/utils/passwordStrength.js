export function scorePassword(pw = '') {
  if (!pw) return { score: 0, label: '', hints: ['Use 8+ characters with letters, numbers & symbols.'] }

  let score = 0
  const hints = []
  const hasLower = /[a-z]/.test(pw)
  const hasUpper = /[A-Z]/.test(pw)
  const hasNum = /\d/.test(pw)
  const hasSym = /[^A-Za-z0-9]/.test(pw)
  const len = pw.length

  if (len >= 8) score += 1
  else hints.push('At least 8 characters')
  if (len >= 12) score += 1
  if (hasLower && hasUpper) score += 1
  else hints.push('Mix upper & lower case (A + a)')
  if (hasNum) score += 1
  else hints.push('Add a number (0–9)')
  if (hasSym) score += 1
  else hints.push('Add a symbol (! @ # $ …)')
  if (len >= 16 && hasNum && hasSym) score += 1

  const labels = ['Weak', 'Strong', 'Stronger', 'Strongest']
  let label = 'Weak'
  if (score <= 1) label = 'Weak'
  else if (score === 2) label = 'Strong'
  else if (score === 3 || score === 4) label = 'Stronger'
  else label = 'Strongest'

  return {
    score: Math.min(score, 4),
    label,
    hints: hints.length ? hints : ['Excellent — hard to guess.'],
    met: { hasLower, hasUpper, hasNum, hasSym, len8: len >= 8 },
  }
}
