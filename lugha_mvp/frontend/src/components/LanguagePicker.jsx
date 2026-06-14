import { useCallback, useState } from 'react'
import api from '../api'
import SearchCombobox from './SearchCombobox.jsx'

export default function LanguagePicker({ label, hint, selectedIds, onChange, placeholder }) {
  const [cache, setCache] = useState({})
  const [resetKey, setResetKey] = useState(0)

  const search = useCallback(async (q) => {
    const params = { limit: 8 }
    if (q) params.q = q
    const { data } = await api.get('/languages/search', { params })
    setCache((c) => {
      const next = { ...c }
      data.forEach((l) => { next[l.id] = l })
      return next
    })
    return data
  }, [])

  const selected = [...selectedIds].map((id) => cache[id]).filter(Boolean)

  return (
    <div className="lang-picker">
      <SearchCombobox
        key={resetKey}
        label={label}
        hint={hint}
        items={[]}
        value={null}
        resetKey={resetKey}
        onChange={() => {}}
        onPick={(lang) => {
          if (!lang || selectedIds.has(lang.id)) return
          onChange(new Set([...selectedIds, lang.id]))
          setResetKey((k) => k + 1)
        }}
        placeholder={placeholder || 'Type a language name…'}
        emptyQueryMessage="Start typing — Swahili, Yoruba, Hausa, Amharic…"
        noResultsMessage="No language found — try another spelling"
        maxVisible={8}
        dynamicSearch={search}
        getKey={(l) => l.id}
        getLabel={(l) => l.name}
        renderOption={(l) => (
          <span className="lang-option">
            <span className="lang-option-name">{l.name}</span>
            {l.is_endangered ? <span className="lang-option-tag">endangered</span> : null}
            {l.country?.name && (
              <span className="lang-option-meta">{l.country.flag_emoji} {l.country.name}</span>
            )}
          </span>
        )}
      />

      {selected.length > 0 && (
        <div className="lang-picker-tags">
          {selected.map((l) => (
            <span key={l.id} className="lang-tag">
              {l.name}
              <button type="button" aria-label={`Remove ${l.name}`} onClick={() => {
                const n = new Set(selectedIds)
                n.delete(l.id)
                onChange(n)
              }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
