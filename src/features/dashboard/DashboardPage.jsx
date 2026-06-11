import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthProvider'
import { fetchProperties, fetchPersons, fetchRents } from '../../lib/rentals'
import { Building2, Users, IndianRupee, AlertCircle, BedDouble, Home, Warehouse } from 'lucide-react'

const typeIcons = { hostel: BedDouble, pg: Home, property: Warehouse }
const typeColors = { hostel: '#8b5cf6', pg: '#f59e0b', property: '#06b6d4' }

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className={`stat-card stat-${accent}`}>
      <div className="stat-card-top">
        <Icon size={24} />
        <span className="stat-value">{value}</span>
      </div>
      <span className="stat-label">{label}</span>
    </div>
  )
}

function PropertyCard({ property, persons, rents }) {
  const Icon = typeIcons[property.type] || Building2
  const color = typeColors[property.type] || '#6366f1'
  const tenantCount = persons.filter(p => p.property_id === property.id).length
  const propertyRents = rents.filter(r => r.property_id === property.id)
  const collected = propertyRents.filter(r => r.status === 'paid').reduce((s, r) => s + Number(r.amount), 0)
  const pending = propertyRents.filter(r => r.status !== 'paid').reduce((s, r) => s + Number(r.amount), 0)

  return (
    <div className="property-card">
      <div className="property-card-head" style={{ background: color }}>
        <Icon size={32} />
        <span className="property-type-badge">{property.type}</span>
      </div>
      <div className="property-card-body">
        <h3>{property.name}</h3>
        {property.address && <p className="text-muted">{property.address}</p>}
        <div className="property-card-stats">
          <div className="pstat">
            <Users size={14} />
            <span>{tenantCount} tenant{tenantCount !== 1 ? 's' : ''}</span>
          </div>
          <div className="pstat">
            <IndianRupee size={14} />
            <span>&#x20B9;{collected} collected</span>
          </div>
        </div>
        {pending > 0 && (
          <div className="property-card-pending">
            <AlertCircle size={14} />
            <span>&#x20B9;{pending} pending</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [properties, setProperties] = useState([])
  const [persons, setPersons] = useState([])
  const [rents, setRents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetchProperties(user.id),
      fetchPersons(user.id),
      fetchRents(user.id),
    ]).then(([props, people, rentsData]) => {
      setProperties(props)
      setPersons(people)
      setRents(rentsData)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [user.id])

  const totalRent = rents.reduce((s, r) => s + Number(r.amount), 0)
  const collectedRent = rents.filter(r => r.status === 'paid').reduce((s, r) => s + Number(r.amount), 0)
  const pendingRent = rents.filter(r => r.status === 'pending' || r.status === 'overdue').reduce((s, r) => s + Number(r.amount), 0)
  const overdueCount = rents.filter(r => r.status === 'overdue').length

  const displayName = user.user_metadata?.full_name || user.user_metadata?.name || user.email

  return (
    <div className="page-dashboard">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p className="page-subtitle">Welcome back, {displayName}</p>
      </div>

      {loading ? (
        <p className="text-muted">Loading...</p>
      ) : (
        <>
          <div className="stats-grid">
            <StatCard icon={Building2} label="Properties" value={properties.length} accent="primary" />
            <StatCard icon={Users} label="Tenants" value={persons.length} accent="info" />
            <StatCard icon={IndianRupee} label="Collected" value={`\u20B9${collectedRent}`} accent="success" />
            <StatCard icon={AlertCircle} label="Overdue" value={overdueCount} accent="danger" />
          </div>

          {properties.length > 0 && (
            <section className="dashboard-section">
              <h2>Your Properties</h2>
              <div className="property-card-grid">
                {properties.map(p => (
                  <PropertyCard key={p.id} property={p} persons={persons} rents={rents} />
                ))}
              </div>
            </section>
          )}

          <div className="dashboard-cards">
            <div className="dash-card">
              <h2>Quick Actions</h2>
              <div className="quick-actions">
                <a href="/add-new" className="quick-action">
                  <span className="qa-icon">+</span>
                  <span>Add Property</span>
                </a>
                <a href="/manage" className="quick-action">
                  <span className="qa-icon">&#x2630;</span>
                  <span>Manage</span>
                </a>
                <a href="/add-new?tab=person" className="quick-action">
                  <span className="qa-icon">&#x1F464;</span>
                  <span>Add Person</span>
                </a>
                <a href="/add-new?tab=rent" className="quick-action">
                  <span className="qa-icon">&#x20B9;</span>
                  <span>Add Rent</span>
                </a>
              </div>
            </div>

            <div className="dash-card">
              <h2>Rent Summary</h2>
              <div className="rent-summary">
                <div className="rent-summary-row">
                  <span>Total Rent</span>
                  <strong>&#x20B9;{totalRent}</strong>
                </div>
                <div className="rent-summary-row">
                  <span>Collected</span>
                  <strong className="text-success">&#x20B9;{collectedRent}</strong>
                </div>
                <div className="rent-summary-row">
                  <span>Pending</span>
                  <strong className="text-danger">&#x20B9;{pendingRent}</strong>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
