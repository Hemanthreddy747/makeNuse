import { useState, useEffect } from 'react'
import { X, Trash2, Plus, Check, Phone, Calendar, IndianRupee, LogOut, Undo2, Paperclip, Camera } from 'lucide-react'
import { useConfirm } from '../../context/ConfirmContext'
import {
  updatePerson, deletePerson, permanentlyDeletePerson,
  fetchRentsByPerson, createRent, updateRent, deleteRent,
  fetchRentTypes,
  fetchPersonDocuments, uploadPersonDocument, deletePersonDocument,
} from '../../lib/rentals'
import { formatDate } from '../../lib/dates'
import DatePicker from './DatePicker'

const MAX_FILE_SIZE = 4 * 1024 * 1024

function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        let w = img.width, h = img.height
        let quality = 0.8
        const maxDim = 2048
        if (w > maxDim || h > maxDim) {
          const ratio = Math.min(maxDim / w, maxDim / h)
          w = Math.round(w * ratio)
          h = Math.round(h * ratio)
        }
        const compress = (q) => {
          const canvas = document.createElement('canvas')
          canvas.width = w
          canvas.height = h
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, w, h)
          return new Promise(res => {
            canvas.toBlob(blob => {
              res(blob)
            }, 'image/jpeg', q)
          })
        }
        ;(async () => {
          let blob = await compress(quality)
          while (blob.size > MAX_FILE_SIZE && quality > 0.1) {
            quality -= 0.1
            blob = await compress(quality)
          }
          if (blob.size > MAX_FILE_SIZE) {
            w = Math.round(w * 0.75)
            h = Math.round(h * 0.75)
            quality = 0.6
            blob = await compress(quality)
          }
          const compressed = new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' })
          resolve(compressed)
        })()
      }
      img.onerror = reject
      img.src = reader.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']

const STATUS_STYLES = {
  paid: { dot: '#16a34a', bg: '#f0fdf4', label: 'Paid' },
  pending: { dot: '#d97706', bg: '#fffbeb', label: 'Pending' },
  overdue: { dot: '#dc2626', bg: '#fef2f2', label: 'Overdue' },
}

function getMonthsInRange(from, to) {
  const months = []
  const d = new Date(from.getFullYear(), from.getMonth(), 1)
  const end = new Date(to.getFullYear(), to.getMonth(), 1)
  while (d <= end) {
    months.push({ month: d.getMonth() + 1, year: d.getFullYear() })
    d.setMonth(d.getMonth() + 1)
  }
  return months
}

function computeToDate(baseType, fromDateStr) {
  const d = fromDateStr ? new Date(fromDateStr) : new Date()
  if (baseType === 'monthly') d.setMonth(d.getMonth() + 1)
  else if (baseType === 'weekly') d.setDate(d.getDate() + 7)
  else if (baseType === 'daily') d.setDate(d.getDate() + 1)
  else if (baseType === 'quarterly') d.setMonth(d.getMonth() + 3)
  else if (baseType === 'yearly') d.setFullYear(d.getFullYear() + 1)
  else d.setMonth(d.getMonth() + 1)
  return d.toISOString().split('T')[0]
}

export default function PersonDetailModal({ person, userId, onClose, onPersonChange }) {
  const confirm = useConfirm()
  const [name, setName] = useState(person.name || '')
  const [phone, setPhone] = useState(person.phone || '')
  const [moveInDate, setMoveInDate] = useState(person.move_in_date || '')
  const [selectedTypeId, setSelectedTypeId] = useState(person.rent_type_id || '')
  const [rentAmount, setRentAmount] = useState(person.rent_amount || '')
  const [rents, setRents] = useState([])
  const [rentTypes, setRentTypes] = useState([])
  const [documents, setDocuments] = useState([])
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [addingRent, setAddingRent] = useState(false)
  const [newRentAmount, setNewRentAmount] = useState('')
  const [newRentPaidDate, setNewRentPaidDate] = useState(new Date().toISOString().split('T')[0])
  const [newRentFrom, setNewRentFrom] = useState(person.move_in_date || '')
  const [newRentTo, setNewRentTo] = useState('')

  useEffect(() => {
    fetchRentsByPerson(person.id).then(setRents).catch(() => {})
  }, [person.id])

  useEffect(() => {
    fetchRentTypes(userId).then(setRentTypes).catch(() => {})
  }, [userId])

  useEffect(() => {
    fetchPersonDocuments(person.id).then(setDocuments).catch(() => {})
  }, [person.id])

  const selectedType = rentTypes.find(t => t.id === selectedTypeId)

  const handleSavePerson = async (overrides = {}) => {
    setSaving(true)
    try {
      await updatePerson(person.id, {
        name, phone, move_in_date: moveInDate || null,
        rent_type_id: selectedTypeId || null,
        rent_amount: rentAmount ? parseFloat(rentAmount) : null,
        ...overrides,
      })
      if (onPersonChange) onPersonChange()
    } catch (err) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleCheckOut = async () => {
    const ok = await confirm(`Mark "${person.name}" as moved out?`)
    if (!ok) return
    await updatePerson(person.id, {
      name: '', phone: '',
      move_in_date: null, rent_type_id: null, rent_amount: null,
    })
    if (onPersonChange) onPersonChange()
    onClose()
  }

  const handleDeletePermanent = async () => {
    if (person.name) {
      const ok = await confirm(
        `Remove "${person.name}" from this room? The bed will show as empty.`
      )
      if (!ok) return
      await updatePerson(person.id, { name: '' })
      await deletePerson(person.id)
    } else {
      const ok = await confirm('Remove this empty bed?')
      if (!ok) return
      await permanentlyDeletePerson(person.id)
    }
    if (onPersonChange) onPersonChange()
    onClose()
  }

  const handleSelectType = (e) => {
    const id = e.target.value
    setSelectedTypeId(id)
    const type = rentTypes.find(t => t.id === id)
    if (type) {
      if (type.amount) setRentAmount(type.amount)
      handleSavePerson({
        rent_type_id: id || null,
        rent_amount: type.amount || null,
      })
    } else {
      handleSavePerson({ rent_type_id: null, rent_amount: null })
    }
  }

  const openAddRent = () => {
    const baseType = selectedType?.type || 'monthly'
    const from = person.move_in_date || ''
    setNewRentAmount(rentAmount ? String(rentAmount) : '')
    setNewRentPaidDate(new Date().toISOString().split('T')[0])
    setNewRentFrom(from)
    setNewRentTo(computeToDate(baseType, from))
    setAddingRent(true)
  }

  const handleAddRent = async (e) => {
    e.preventDefault()
    if (!newRentAmount) return
    setSaving(true)
    try {
      const fromDate = newRentFrom ? new Date(newRentFrom) : new Date()
      const toDate = newRentTo ? new Date(newRentTo) : new Date()
      const months = getMonthsInRange(fromDate, toDate)
      const results = []
      for (const { month, year } of months) {
        const data = await createRent({
          userId,
          personId: person.id,
          propertyId: person.property_id,
          amount: parseFloat(newRentAmount),
          status: 'paid',
          paidDate: newRentPaidDate || new Date().toISOString().split('T')[0],
          month,
          year,
        })
        results.push(data)
      }
      setRents(prev => [...results, ...prev])
      setAddingRent(false)
    } catch (err) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateRentStatus = async (rentId, currentStatus) => {
    const next = currentStatus === 'paid' ? 'pending' : 'paid'
    await updateRent(rentId, { status: next, paid_date: next === 'paid' ? new Date().toISOString().split('T')[0] : null })
    setRents(prev => prev.map(r => r.id === rentId ? { ...r, status: next, paid_date: next === 'paid' ? new Date().toISOString().split('T')[0] : null } : r))
  }

  const handleDeleteRent = async (rentId) => {
    const ok = await confirm('Delete this rent record?')
    if (!ok) return
    await deleteRent(rentId)
    setRents(prev => prev.filter(r => r.id !== rentId))
  }

  const handleUpload = async (e) => {
    const files = e.target.files
    if (!files?.length) return
    const remaining = 3 - documents.length
    if (files.length > remaining) {
      alert(`You can only add ${remaining} more file(s). Max 3 allowed.`)
      return
    }
    setUploading(true)
    try {
      for (const file of files) {
        let uploadFile = file
        if (file.size > MAX_FILE_SIZE) {
          if (file.type.startsWith('image/')) {
            uploadFile = await compressImage(file)
          } else {
            alert(`${file.name} is over 4MB. Only images can be auto-compressed.`)
            continue
          }
        }
        const doc = await uploadPersonDocument({ userId, personId: person.id, file: uploadFile })
        setDocuments(prev => [doc, ...prev])
      }
    } catch (err) {
      alert(err.message)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleDeleteDocument = async (id, filePath) => {
    const ok = await confirm('Delete this document?')
    if (!ok) return
    await deletePersonDocument(id, filePath)
    setDocuments(prev => prev.filter(d => d.id !== id))
  }

  return (
    <div className="pd-overlay" onClick={onClose}>
      <div className="pd-modal" onClick={e => e.stopPropagation()}>
        <div className="pd-header">
          <div className="pd-header-info">
            <h2>{person.name || 'New Occupant'}</h2>
            {person.property?.name && (
              <span className="pd-header-sub">{person.property.name}</span>
            )}
          </div>
          <button className="pd-close" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="pd-body">
          <section className="pd-card">
            <div className="pd-card-header">
              <span className="pd-card-icon"><Phone size={14} /></span>
              <h3>Person Details</h3>
            </div>
            <div className="pd-card-body">
              <div className="pd-field">
                <label>Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} onBlur={() => handleSavePerson()} placeholder="Tenant name" />
              </div>
              <div className="pd-row">
                <div className="pd-field">
                  <label>Phone</label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} onBlur={() => handleSavePerson()} placeholder="9876543210" />
                </div>
                <div className="pd-field">
                  <label>Move-in Date</label>
                  <DatePicker value={moveInDate} onChange={e => { const d = e.target.value; setMoveInDate(d); handleSavePerson({ move_in_date: d || null }) }} />
                </div>
              </div>
              <div className="pd-docs-inline">
                <div className="pd-docs-inline-head">
                  <Paperclip size={13} />
                  <span>Documents</span>
                  {documents.length < 3 && (
                    <>
                      <label className="pd-upload-label" title="Take photo">
                        <Camera size={12} />
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={handleUpload}
                          disabled={uploading}
                          style={{ display: 'none' }}
                        />
                      </label>
                      <label className="pd-upload-label" title="Upload from device">
                        {uploading ? '...' : <><Plus size={12} /> Add</>}
                        <input
                          type="file"
                          accept="image/*,.pdf,.doc,.docx"
                          multiple
                          onChange={handleUpload}
                          disabled={uploading}
                          style={{ display: 'none' }}
                        />
                      </label>
                    </>
                  )}
                </div>
                {documents.length === 0 ? (
                  <p className="pd-empty">No documents yet.</p>
                ) : (
                  <div className="pd-doc-list">
                    {documents.map(doc => (
                      <div key={doc.id} className="pd-doc-item">
                        <Paperclip size={13} className="pd-doc-icon" />
                        <span className="pd-doc-name">{doc.file_name}</span>
                        <button className="pd-action-icon danger" onClick={() => handleDeleteDocument(doc.id, doc.file_path)} title="Delete">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="pd-card">
            <div className="pd-card-header">
              <span className="pd-card-icon"><IndianRupee size={14} /></span>
              <h3>Rent System</h3>
            </div>
            <div className="pd-card-body">
              <div className="pd-row">
                <div className="pd-field">
                  <label>Rent Type</label>
                  <select value={selectedTypeId} onChange={handleSelectType}>
                    <option value="">Select a rent type...</option>
                    {rentTypes.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div className="pd-field">
                  <label>Amount</label>
                  <input type="number" step="0.01" value={rentAmount} onChange={e => setRentAmount(e.target.value)} onBlur={() => handleSavePerson()} placeholder={selectedType?.amount ? `₹${selectedType.amount}` : 'Enter amount'} />
                </div>
              </div>
            </div>
          </section>

          <section className="pd-card">
            <div className="pd-card-header">
              <span className="pd-card-icon"><Calendar size={14} /></span>
              <h3>Rent Records</h3>
              <button className="pd-card-action" onClick={openAddRent} disabled={!selectedType}>
                <Plus size={13} /> Add
              </button>
            </div>
            <div className="pd-card-body">
              {addingRent && (
                <form className="pd-mini-form pd-mini-form--col" onSubmit={handleAddRent}>
                  <div className="pd-row">
                    <div className="pd-field">
                      <label>Amount</label>
                      <input type="number" step="0.01" value={newRentAmount} onChange={e => setNewRentAmount(e.target.value)} required placeholder="5000" />
                    </div>
                    <div className="pd-field">
                      <label>Pay Date</label>
                      <DatePicker value={newRentPaidDate} onChange={e => setNewRentPaidDate(e.target.value)} />
                    </div>
                  </div>
                  <div className="pd-row">
                    <div className="pd-field">
                      <label>From</label>
                      <DatePicker value={newRentFrom} onChange={e => setNewRentFrom(e.target.value)} />
                    </div>
                    <div className="pd-field">
                      <label>To</label>
                      <DatePicker value={newRentTo} onChange={e => setNewRentTo(e.target.value)} />
                    </div>
                  </div>
                  {newRentFrom && newRentTo && (
                    <p className="pd-range-hint">
                      Covers {getMonthsInRange(new Date(newRentFrom), new Date(newRentTo)).length} month(s)
                    </p>
                  )}
                  <div className="pd-mini-actions">
                    <button type="submit" className="pd-btn pd-btn-primary" disabled={saving || !newRentAmount}>
                      {saving ? 'Saving...' : 'Record Payment'}
                    </button>
                    <button type="button" className="pd-btn pd-btn-ghost" onClick={() => setAddingRent(false)}>Cancel</button>
                  </div>
                </form>
              )}

              {rents.length === 0 && !addingRent ? (
                <p className="pd-empty">No rent records yet.</p>
              ) : (
                <div className="pd-rent-list">
                  {rents.map(rent => {
                    const s = STATUS_STYLES[rent.status] || STATUS_STYLES.pending
                    const monthLabel = MONTHS[(rent.month || 1) - 1]
                    return (
                      <div key={rent.id} className="pd-rent-item">
                        <div className="pd-rent-main">
                          <span className="pd-rent-amount">{'\u20B9'}{rent.amount}</span>
                          <span className="pd-rent-status" style={{ background: s.bg, color: s.dot }}>
                            <span className="pd-status-dot" style={{ background: s.dot }} />
                            {s.label}
                          </span>
                        </div>
                        <div className="pd-rent-sub">
                          {monthLabel} {rent.year}
                          {rent.paid_date ? ` · Paid ${formatDate(rent.paid_date)}` : ''}
                        </div>
                        <div className="pd-rent-actions">
                          {rent.status !== 'paid' ? (
                            <button className="pd-action-icon paid" onClick={() => handleUpdateRentStatus(rent.id, rent.status)} title="Mark paid"><Check size={13} /></button>
                          ) : (
                            <button className="pd-action-icon" onClick={() => handleUpdateRentStatus(rent.id, rent.status)} title="Revert"><Undo2 size={13} /></button>
                          )}
                          <button className="pd-action-icon danger" onClick={() => handleDeleteRent(rent.id)} title="Delete"><Trash2 size={13} /></button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="pd-footer">
          <div className="pd-footer-left">
            <button className="pd-btn pd-btn-danger" onClick={handleDeletePermanent}>
              <Trash2 size={14} /> Delete
            </button>
          </div>
          <div className="pd-footer-right">
            <button className="pd-btn pd-btn-warning" onClick={handleCheckOut}>
              <LogOut size={14} /> Check Out
            </button>
            <button className="pd-btn pd-btn-primary" onClick={onClose}>
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
