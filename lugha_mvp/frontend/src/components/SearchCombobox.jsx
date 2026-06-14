import { useEffect, useId, useMemo, useRef, useState } from 'react'

function norm(s) {
  return (s || '').toLowerCase().trim()
}

export default function SearchCombobox({
  label,
  items = [],
  value,
  onChange,
  onPick,
  placeholder = 'Type to search…',
  hint,
  required,
  getKey = (x) => x.id,
  getLabel = (x) => x.name,
  filterItem = (item, q) => norm(getLabel(item)).includes(q),
  renderOption,
  maxVisible = 8,
  emptyQueryMessage,
  noResultsMessage,
  leadingIcon,
  dynamicSearch,
  resetKey,
}) {
  const id = useId()
  const listId = `${id}-list`
  const wrapRef = useRef(null)
  const inputRef = useRef(null)

  const selected = items.find((x) => getKey(x) === value) || null
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const [remoteItems, setRemoteItems] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setQuery(selected ? getLabel(selected) : '')
  }, [resetKey, value])

  useEffect(() => {
    const onDoc = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const q = norm(query)

  useEffect(() => {
    if (!dynamicSearch || !open) return undefined
    let cancelled = false
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const data = await dynamicSearch(query.trim())
        if (!cancelled) setRemoteItems(data || [])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }, query.trim() ? 180 : 0)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [query, open, dynamicSearch])

  const matches = useMemo(() => {
    const source = dynamicSearch ? remoteItems : items
    let list = source
    if (!dynamicSearch && q) list = source.filter((it) => filterItem(it, q))
    else if (!dynamicSearch) list = source.slice(0, maxVisible)
    return list.slice(0, maxVisible)
  }, [items, remoteItems, q, maxVisible, filterItem, dynamicSearch])

  const pick = (item) => {
    onChange(item ? getKey(item) : null)
    setQuery(item ? getLabel(item) : '')
    setOpen(false)
    setActive(0)
    onPick?.(item)
    if (onPick && !value) setQuery('')
  }

  const onKeyDown = (e) => {
    if (!open && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      setOpen(true)
      return
    }
    if (e.key === 'Escape') {
      setOpen(false)
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => Math.min(i + 1, Math.max(matches.length - 1, 0)))
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => Math.max(i - 1, 0))
    }
    if (e.key === 'Enter' && open && matches[active]) {
      e.preventDefault()
      pick(matches[active])
    }
  }

  const showEmpty = open && !loading && query.trim() && matches.length === 0

  return (
    <div className="search-combo" ref={wrapRef}>
      {label && <label className="form-label" htmlFor={id}>{label}</label>}
      {hint && <p className="field-hint">{hint}</p>}
      <div className={`search-combo-field ${open ? 'open' : ''} ${selected ? 'has-value' : ''}`}>
        {leadingIcon}
        <input
          ref={inputRef}
          id={id}
          className="search-combo-input"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          autoComplete="off"
          placeholder={placeholder}
          value={query}
          required={required && !selected && !onPick}
          onChange={(e) => {
            setQuery(e.target.value)
            if (selected && e.target.value !== getLabel(selected)) onChange(null)
            setOpen(true)
            setActive(0)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
        />
        {query && (
          <button
            type="button"
            className="search-combo-clear"
            aria-label="Clear"
            onClick={() => {
              setQuery('')
              onChange(null)
              inputRef.current?.focus()
            }}
          >
            ×
          </button>
        )}
      </div>

      {open && (
        <div className="search-combo-panel">
          {!q && emptyQueryMessage && (
            <p className="search-combo-panel-hint">{emptyQueryMessage}</p>
          )}
          {loading && <p className="search-combo-panel-hint">Searching…</p>}
          {showEmpty ? (
            <p className="search-combo-empty">{noResultsMessage || `No matches for “${query}”`}</p>
          ) : (
            <ul id={listId} className="search-combo-list" role="listbox">
              {matches.map((item, i) => (
                <li key={getKey(item)} role="option" aria-selected={value === getKey(item)}>
                  <button
                    type="button"
                    className={`search-combo-option ${i === active ? 'active' : ''} ${value === getKey(item) ? 'selected' : ''}`}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => pick(item)}
                  >
                    {renderOption ? renderOption(item) : getLabel(item)}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
