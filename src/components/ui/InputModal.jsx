import { useState, useEffect, useRef } from 'react'

export default function InputModal({ open, title, placeholder, initialValue, onConfirm, onCancel }) {
  const [val, setVal] = useState(initialValue || '')
  const inputRef = useRef(null)

  useEffect(() => {
    if (open) {
      setVal(initialValue || '')
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open, initialValue])

  if (!open) return null

  const submit = () => {
    onConfirm(val.trim())
  }

  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="input-modal" onClick={e => e.stopPropagation()}>
        <p className="input-modal-title">{title}</p>
        <input
          ref={inputRef}
          className="input-modal-input"
          value={val}
          placeholder={placeholder || ''}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') onCancel() }}
        />
        <div className="input-modal-actions">
          <button className="confirm-btn confirm-btn-no" onClick={onCancel}>Cancel</button>
          <button className="input-modal-btn" onClick={submit}>Save</button>
        </div>
      </div>
    </div>
  )
}
