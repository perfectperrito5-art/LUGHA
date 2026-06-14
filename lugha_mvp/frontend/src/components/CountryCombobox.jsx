import { useEffect, useId, useRef, useState } from 'react'

function normalize(s) {
  return (s || '').toLowerCase().trim()
}

export default function CountryCombobox({ countries = [], value, onChange, required }) {
  const id = useId()
  const listId = `${id}-list`
  const wrapRef = useRef(null)
  const inputRef = useRef(null)

  const selected = countries.find((c) => c.id === value) || null
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState(selected?.name || '')
  const [active, setActive] = useState(0)

  useEffect(() => {
    const onDoc = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const q = normalize(query)
  const matches = q
    ? countries.filter(
        (c) =>
          normalize(c.name).includes(q) ||
          normalize(c.region).includes(q) ||
          normalize(c.iso_code).includes(q)
      )
    : countries

  const pick = (country) => {
    onChange(country?.id ?? null)
    setQuery(country?.name || '')
    setOpen(false)
    setActive(0)
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

  return (
    <div className="country-combo" ref={wrapRef}>
      <label className="form-label" htmlFor={id}>Country</label>
      <div className={`country-combo-field ${open ? 'open' : ''} ${selected ? 'has-value' : ''}`}>
        {selected?.flag_emoji && <span className="country-combo-flag" aria-hidden>{selected.flag_emoji}</span>}
        <input
          ref={inputRef}
          id={id}
          className="country-combo-input"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          autoComplete="off"
          placeholder="Type your country…"
          value={query}
          required={required && !selected}
          onChange={(e) => {
            setQuery(e.target.value)
            onChange(null)
            setOpen(true)
            setActive(0)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
        />
        {query && (
          <button
            type="button"
            className="country-combo-clear"
            aria-label="Clear country"
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
        <ul id={listId} className="country-combo-list" role="listbox">
          {matches.length === 0 ? (
            <li className="country-combo-empty">No countries match “{query}”</li>
          ) : (
            matches.map((c, i) => (
              <li key={c.id} role="option" aria-selected={value === c.id}>
                <button
                  type="button"
                  className={`country-combo-option ${i === active ? 'active' : ''} ${value === c.id ? 'selected' : ''}`}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => pick(c)}
                >
                  <span className="country-combo-option-flag">{c.flag_emoji}</span>
                  <span className="country-combo-option-text">
                    <span className="country-combo-option-name">{c.name}</span>
                    <span className="country-combo-option-region">{c.region}</span>
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}
