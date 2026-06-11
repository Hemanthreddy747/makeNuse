import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthProvider'
import { fetchProperties, fetchPersons, createRent } from '../../lib/rentals'
import { Receipt, Building2 } from 'lucide-react'
import VisualPropertyBuilder from '../../components/ui/VisualPropertyBuilder'

const tabs = [
  { key: 'builder', label: 'Builder', icon: Building2 },
  { key: 'rent', label: 'Rent', icon: Receipt },
]

function RentForm({ userId, onSuccess }) {
  const now = new Date()
  const [properties, setProperties] = useState([])
  const [persons, setPersons] = useState([])
  const [filteredPersons, setFilteredPersons] = useState([])
  const [propertyId, setPropertyId] = useState('')
  const [personId, setPersonId] = useState('')
  const [amount, setAmount] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [status, setStatus] = useState('pending')
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([fetchProperties(userId), fetchPersons(userId)]).then(([props, people]) => {
      setProperties(props)
      setPersons(people)
    }).catch(() => {})
  }, [userId])

  useEffect(() => {
    if (propertyId) {
      setFilteredPersons(persons.filter(p => p.property_id === propertyId))
      setPersonId('')
    } else {
      setFilteredPersons(persons)
    }
  }, [propertyId, persons])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await createRent({ userId, personId, propertyId, amount: parseFloat(amount), dueDate, status, month, year })
      setPersonId(''); setAmount(''); setDueDate(''); setStatus('pending')
      onSuccess()
    } catch (err) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rental-form">
      <div className="form-group">
        <label>Property</label>
        <select value={propertyId} onChange={e => setPropertyId(e.target.value)} required>
          <option value="">Select property</option>
          {properties.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label>Person</label>
        <select value={personId} onChange={e => setPersonId(e.target.value)} required>
          <option value="">Select person</option>
          {filteredPersons.map(p => (
            <option key={p.id} value={p.id}>{p.name}{p.room_no ? ` (Room ${p.room_no})` : ''}</option>
          ))}
        </select>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Amount</label>
          <input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} required placeholder="5000" />
        </div>
        <div className="form-group">
          <label>Status</label>
          <select value={status} onChange={e => setStatus(e.target.value)}>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>
      <div className="form-group">
        <label>Due Date</label>
        <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Month</label>
          <select value={month} onChange={e => setMonth(Number(e.target.value))}>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Year</label>
          <input type="number" value={year} onChange={e => setYear(Number(e.target.value))} />
        </div>
      </div>
      <button type="submit" className="btn-primary" disabled={saving}>
        {saving ? 'Saving...' : 'Add Rent'}
      </button>
    </form>
  )
}

export default function AddNewPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('builder')
  const [msg, setMsg] = useState('')

  const showSuccess = () => {
    setMsg('Added successfully!')
    setTimeout(() => setMsg(''), 3000)
  }

  return (
    <div className="page-add-new">
      <div className="page-header">
        <h1>Add New</h1>
        <p className="page-subtitle">Build your property structure visually</p>
      </div>

      {msg && <div className="status-msg status-msg--success">{msg}</div>}

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
        {activeTab === 'builder' && <VisualPropertyBuilder />}
        {activeTab === 'rent' && <RentForm userId={user.id} onSuccess={showSuccess} />}
      </div>
    </div>
  )
}
