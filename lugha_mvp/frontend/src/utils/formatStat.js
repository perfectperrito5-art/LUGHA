/** Compact stat labels for the landing hero (hackathon-friendly). */
export function formatWordsStat(n = 0) {
  if (n >= 1_000_000) return `${Math.floor(n / 1_000_000)}M+`
  if (n >= 1_000) return `${Math.floor(n / 1_000)}K+`
  return '1K+'
}

export function formatGuardiansStat(n = 0) {
  if (n >= 50) return `${n}+`
  return '50+'
}
