import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthProvider'
import {
  fetchPersons, deletePerson, updatePerson,
  fetchRents, deleteRent, updateRent,
} from '../../lib/rentals'
import { Building2, Users, Receipt, Clock, Trash2, X, Check } from 'lucide-react'
import VisualPropertyBuilder from '../../components/ui/VisualPropertyBuilder'
import HistoryPropertyBuilder from '../../components/ui/HistoryPropertyBuilder'
import { useConfirm } from '../../context/ConfirmContext'

const tabs = [
  { key: 'properties', label: 'Properties', icon: Building2 },
  { key: 'persons', label: 'Persons', icon: Users },
  { key: 'rents', label: 'Rents', icon: Receipt },
  { key: 'history', label: 'History', icon: Clock },
]

function EditableCell({ value, onSave }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(value)

  useEffect(() => { setVal(value) }, [value])

  if (!editing) {
    return (
      <span className="editable-cell" onClick={() => setEditing(true)}>
        {value || <span className="text-muted">-</span>}
      </span>
    )
  }

  return (
    <span className="editable-cell editing">
      <input value={val} onChange={e => setVal(e.target.value)} autoFocus />
      <button className="icon-btn success" onClick={() => { onSave(val); setEditing(false) }}><Check size={14} /></button>
      <button className="icon-btn" onClick={() => { setVal(value); setEditing(false) }}><X size={14} /></button>
    </span>
  )
}

function PersonRow({ person, onDelete }) {
  const confirm = useConfirm()
  return (
    <div className="list-row">
      <div className="list-row-info">
        <strong>{person.name}</strong>
        <span className="text-muted">
          {person.phone && `${person.phone}`}
          {person.property?.name ? ` @ ${person.property.name}` : ''}
          {person.floor?.name ? ` - ${person.floor.name}` : ''}
          {person.room?.name ? ` - ${person.room.name}` : ''}
          {person.room_no ? ` (Room ${person.room_no})` : ''}
        </span>
      </div>
      <div className="list-row-actions">
        <button className="icon-btn danger" onClick={async () => { const ok = await confirm('Delete this person?'); if (ok) onDelete(person.id) }}><Trash2 size={16} /></button>
      </div>
    </div>
  )
}

function RentRow({ rent, onDelete, onUpdate }) {
  const confirm = useConfirm()
  const statusClass = `rent-status rent-status-${rent.status}`

  const toggleStatus = () => {
    const next = rent.status === 'paid' ? 'pending' : 'paid'
    onUpdate(rent.id, { status: next, paid_date: next === 'paid' ? new Date().toISOString().split('T')[0] : null })
  }

  return (
    <div className="list-row">
      <div className="list-row-info">
        <strong>{rent.person?.name || 'Unknown'}</strong>
        <span className="text-muted">
          {rent.property?.name ? `${rent.property.name} - ` : ''}
          &#x20B9;{rent.amount} - {new Date(rent.due_date).toLocaleDateString()}
        </span>
        <span className={statusClass}>{rent.status}</span>
      </div>
      <div className="list-row-actions">
        {rent.status !== 'paid' && (
          <button className="icon-btn success" onClick={toggleStatus} title="Mark paid"><Check size={16} /></button>
        )}
        <button className="icon-btn danger" onClick={async () => { const ok = await confirm('Delete this rent record?'); if (ok) onDelete(rent.id) }}><Trash2 size={16} /></button>
      </div>
    </div>
  )
}

export default function ManagePage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('properties')
  const [persons, setPersons] = useState([])
  const [rents, setRents] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    Promise.all([
      fetchPersons(user.id),
      fetchRents(user.id),
    ]).then(([pe, r]) => {
      setPersons(pe)
      setRents(r)
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  useEffect(load, [user.id])

  const handleDeletePerson = async (id) => {
    await deletePerson(id); load()
  }
  const handleDeleteRent = async (id) => {
    await deleteRent(id); load()
  }
  const confirmDel = useConfirm()

  const handleUpdatePerson = async (id, fields) => {
    await updatePerson(id, fields); load()
  }
  const handleUpdateRent = async (id, fields) => {
    await updateRent(id, fields); load()
  }

  const empty = (items) => items.length === 0

  return (
    <div className="page-manage">
      <div className="page-header">
        <h1>Manage</h1>
        <p className="page-subtitle">View and manage your properties, floors, rooms, and tenants</p>
      </div>

      <div className="tab-bar">
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`tab-btn${activeTab === tab.key ? ' active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            <tab.icon size={18} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="tab-content">
        {loading ? (
          <p className="text-muted">Loading...</p>
        ) : (
          <>
            {activeTab === 'properties' && (
              <VisualPropertyBuilder />
            )}

            {activeTab === 'persons' && (
              <>
                {empty(persons) ? (
                  <p className="text-muted">No persons yet. Add one from Add New.</p>
                ) : (
                  <div className="list-container">
                    {persons.map(p => (
                      <PersonRow key={p.id} person={p} onDelete={handleDeletePerson} onUpdate={handleUpdatePerson} />
                    ))}
                  </div>
                )}
              </>
            )}

            {activeTab === 'rents' && (
              <>
                {empty(rents) ? (
                  <p className="text-muted">No rents yet. Add one from Add New.</p>
                ) : (
                  <div className="list-container">
                    {rents.map(r => (
                      <RentRow key={r.id} rent={r} onDelete={handleDeleteRent} onUpdate={handleUpdateRent} />
                    ))}
                  </div>
                )}
              </>
            )}

            {activeTab === 'history' && (
              <HistoryPropertyBuilder />
            )}
          </>
        )}
      </div>
    </div>
  )
}
