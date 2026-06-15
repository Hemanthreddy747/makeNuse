import { useState, useEffect, useRef } from 'react'
import { Plus, Trash2, Pencil, X, Check } from 'lucide-react'
import { useConfirm } from '../../context/ConfirmContext'
import {
  fetchRentTypes, createRentType, updateRentType, deleteRentType,
} from '../../lib/rentals'

const BASE_TYPES = [
  { value: 'monthly', label: 'Monthly', defaultDays: '30/31' },
  { value: 'weekly', label: 'Weekly', defaultDays: 7 },
  { value: 'daily', label: 'Daily', defaultDays: 1 },
  { value: 'quarterly', label: 'Quarterly', defaultDays: 90 },
  { value: 'yearly', label: 'Yearly', defaultDays: 365 },
  { value: 'custom', label: 'Custom', defaultDays: '' },
]

export default function RentTypesManager({ userId, onTypesChange }) {
  const confirm = useConfirm()
  const [types, setTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState('monthly')
  const [newAmount, setNewAmount] = useState('')
  const [newDays, setNewDays] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editType, setEditType] = useState('')
  const [editAmount, setEditAmount] = useState('')
  const [editDays, setEditDays] = useState('')
  const loadingRef = useRef(false)

  const load = () => {
    if (loadingRef.current) return
    loadingRef.current = true
    fetchRentTypes(userId).then(data => {
      setTypes(data)
      setLoading(false)
      if (onTypesChange) onTypesChange(data)
    }).catch(() => setLoading(false))
  }

  useEffect(load, [userId])

  const handleAdd = async () => {
    if (!newName.trim()) return
    const data = await createRentType({
      userId,
      name: newName.trim(),
      type: newType,
      amount: newAmount ? parseFloat(newAmount) : null,
      days: newDays && newDays !== '30/31' ? parseInt(newDays) : null,
    })
    setTypes(prev => [...prev, data])
    setNewName(''); setNewType('monthly'); setNewAmount(''); setNewDays('')
    setAdding(false)
    if (onTypesChange) onTypesChange([...types, data])
  }

  const handleUpdate = async (id, fields) => {
    const data = await updateRentType(id, fields)
    setTypes(prev => prev.map(t => t.id === id ? data : t))
    if (onTypesChange) onTypesChange(types.map(t => t.id === id ? data : t))
  }

  const handleDelete = async (id) => {
    const ok = await confirm(`Delete this rent type?`)
    if (!ok) return
    await deleteRentType(id)
    setTypes(prev => prev.filter(t => t.id !== id))
    if (onTypesChange) onTypesChange(types.filter(t => t.id !== id))
  }

  const startEdit = (rentType) => {
    setEditingId(rentType.id)
    setEditName(rentType.name)
    setEditType(rentType.type)
    setEditAmount(rentType.amount || '')
    setEditDays(rentType.days || '')
  }

  const cancelEdit = () => setEditingId(null)

  const saveEdit = async (id) => {
    if (!editName.trim()) return
    await handleUpdate(id, {
      name: editName.trim(),
      type: editType,
      amount: editAmount ? parseFloat(editAmount) : null,
      days: editDays && editDays !== '30/31' ? parseInt(editDays) : null,
    })
    setEditingId(null)
  }

  if (loading) {
    return <div className="rtt-skeleton"><div className="rtt-skeleton-row" /><div className="rtt-skeleton-row" /><div className="rtt-skeleton-row" /></div>
  }

  return (
    <div className="rtt-shell">
      <div className="rtt-bar">
        <span className="rtt-title">Rent Types</span>
        <span className="rtt-count">{types.length}</span>
        <button className="rtt-btn" onClick={() => setAdding(!adding)}>
          <Plus size={14} /> {adding ? 'Cancel' : 'Add'}
        </button>
      </div>

      {adding && (
        <div className="rtt-add">
          <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Name" autoFocus />
          <select value={newType} onChange={e => { const t = BASE_TYPES.find(bt => bt.value === e.target.value); setNewType(e.target.value); setNewDays(t?.defaultDays ?? '') }}>
            {BASE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <input type="number" min="1" value={newDays} onChange={e => setNewDays(e.target.value)} placeholder={newType === 'monthly' ? '30/31' : 'Days'} />
          <input type="number" step="0.01" value={newAmount} onChange={e => setNewAmount(e.target.value)} placeholder="Amount" />
          <button className="rtt-btn rtt-btn--primary" onClick={handleAdd} disabled={!newName.trim()}>
            <Check size={14} />
          </button>
        </div>
      )}

      {types.length === 0 && !adding ? (
        <div className="rtt-empty">
          <p>No rent types yet.</p>
          <button className="rtt-btn rtt-btn--primary" onClick={() => setAdding(true)}><Plus size={14} /> Add Type</button>
        </div>
      ) : (
        <div className="rtt-table-wrap">
          <table className="rtt-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Days</th>
                <th>Amount</th>
                <th className="rtt-th-actions"></th>
              </tr>
            </thead>
            <tbody>
              {types.map(rentType => {
                const isEditing = editingId === rentType.id
                const typeLabel = BASE_TYPES.find(t => t.value === rentType.type)?.label || rentType.type

                if (isEditing) {
                  return (
                    <tr key={rentType.id} className="rtt-row-editing">
                      <td><input value={editName} onChange={e => setEditName(e.target.value)} autoFocus /></td>
                      <td>
                        <select value={editType} onChange={e => { const t = BASE_TYPES.find(bt => bt.value === e.target.value); setEditType(e.target.value); setEditDays(t?.defaultDays ?? '') }}>
                          {BASE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                      </td>
                      <td><input type="number" min="1" value={editDays} onChange={e => setEditDays(e.target.value)} placeholder="—" /></td>
                      <td><input type="number" step="0.01" value={editAmount} onChange={e => setEditAmount(e.target.value)} placeholder="—" /></td>
                      <td>
                        <div className="rtt-row-actions">
                          <button className="rtt-action-btn" onClick={() => saveEdit(rentType.id)} disabled={!editName.trim()} title="Save"><Check size={14} /></button>
                          <button className="rtt-action-btn" onClick={cancelEdit} title="Cancel"><X size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  )
                }

                return (
                  <tr key={rentType.id}>
                    <td><span className="rtt-name">{rentType.name}</span></td>
                    <td><span className="rtt-type">{typeLabel}</span></td>
                    <td>{rentType.days != null ? `${rentType.days}` : rentType.type === 'monthly' ? <span className="rtt-muted">30/31</span> : <span className="rtt-muted">—</span>}</td>
                    <td>{rentType.amount != null ? `₹${Number(rentType.amount).toLocaleString('en-IN')}` : <span className="rtt-muted">—</span>}</td>
                    <td>
                      <div className="rtt-row-actions">
                        <button className="rtt-action-btn" onClick={() => startEdit(rentType)} title="Edit"><Pencil size={14} /></button>
                        <button className="rtt-action-btn rtt-action-btn--danger" onClick={() => handleDelete(rentType.id)} title="Delete"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
