/** Confidence + verification badge for knowledge graph entries */
const STATUS_LABEL = {
  pending: 'New',
  community: 'Community',
  verified: 'Verified',
}

export default function ConfidenceBadge({ score = 42, status = 'pending', compact }) {
  const pct = Math.min(100, Math.max(0, score))
  const level = status === 'verified' ? 'verified' : status === 'community' ? 'community' : 'pending'

  if (compact) {
    return (
      <span className={`conf-badge conf-badge--${level}`} title={`${pct}% confidence`}>
        {pct}%
      </span>
    )
  }

  return (
    <div className={`conf-badge conf-badge--${level} conf-badge--full`}>
      <div className="conf-badge-top">
        <span className="conf-badge-status">{STATUS_LABEL[status] || status}</span>
        <span className="conf-badge-pct">{pct}%</span>
      </div>
      <div className="conf-badge-track">
        <div className="conf-badge-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
