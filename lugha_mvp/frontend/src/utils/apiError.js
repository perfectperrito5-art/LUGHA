/** Turn FastAPI / axios errors into a readable string. */
export function apiErrorMessage(err, fallback = 'Something went wrong') {
  const detail = err?.response?.data?.detail
  if (!detail) return err?.message?.includes('Network') ? 'Cannot reach server — is the backend running?' : fallback
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    return detail.map((d) => d.msg || d.message || JSON.stringify(d)).join(' · ')
  }
  return fallback
}
