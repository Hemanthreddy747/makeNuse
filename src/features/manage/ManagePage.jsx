import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthProvider'
import {
  fetchPersonsPaginated, fetchPersons, deletePerson, updatePerson,
  fetchRentObligations,
  fetchAllRooms,
} from '../../lib/rentals'
import { Building2, Users, Clock, X, Check, Phone, ChevronDown, ChevronUp, IndianRupee } from 'lucide-react'
import { formatDateTime } from '../../lib/dates'
import VisualPropertyBuilder from '../../components/ui/VisualPropertyBuilder'
import DataTable from '../../components/ui/DataTable'
import PersonDetailModal from '../../components/ui/PersonDetailModal'
import Loader from '../../components/ui/Loader'

const tabs = [
  { key: 'properties', label: 'Properties', icon: Building2 },
  { key: 'persons', label: 'People', icon: Users },
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



function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className={`stat-card stat-${accent}`}>
      <div className="stat-card-top">
        {Icon && <Icon size={20} />}
        <span className="stat-value">{value}</span>
      </div>
      <span className="stat-label">{label}</span>
    </div>
  )
}

function StatsGrid({ persons, rents }) {
  const roomPersons = persons.filter(p => p.room_id)
  const filledBeds = roomPersons.filter(p => p.name?.trim()).length
  const emptyBeds = roomPersons.filter(p => !p.name?.trim()).length
  const collected = rents.filter(r => r.status === 'paid').reduce((s, r) => s + Number(r.amount), 0)
  const due = rents.filter(r => r.status !== 'paid' && r.status !== 'cancelled').reduce((s, r) => s + Number(r.amount), 0)

  return (
    <div className="stats-grid">
      <StatCard icon={Users} label="Filled" value={filledBeds} accent="success" />
      <StatCard icon={Users} label="Empty" value={emptyBeds} accent="warning" />
      <StatCard label="Collected" value={'\u20B9' + collected} accent="success" />
      <StatCard label="Due" value={'\u20B9' + due} accent="danger" />
    </div>
  )
}

export default function ManagePage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('properties')
  const [roomPersons, setRoomPersons] = useState([])
  const [roomPersonsCount, setRoomPersonsCount] = useState(0)
  const [roomPage, setRoomPage] = useState(0)
  const [roomSort, setRoomSort] = useState({ by: 'created_at', dir: 'desc' })
  const [roomSearch, setRoomSearch] = useState('')
  const [unassignedPersons, setUnassignedPersons] = useState([])
  const [unassignedPersonsCount, setUnassignedPersonsCount] = useState(0)
  const [unassignedPage, setUnassignedPage] = useState(0)
  const [unassignedSort, setUnassignedSort] = useState({ by: 'created_at', dir: 'desc' })
  const [unassignedSearch, setUnassignedSearch] = useState('')
  const [rents, setRents] = useState([])
  const [rooms, setRooms] = useState([])
  const [allPersons, setAllPersons] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPerson, setSelectedPerson] = useState(null)
  const [showUnassigned, setShowUnassigned] = useState(false)
  const PAGE_SIZE = 50
  const [debouncedRoomSearch, setDebouncedRoomSearch] = useState('')
  const [debouncedUnassignedSearch, setDebouncedUnassignedSearch] = useState('')
  const [collapsed, setCollapsed] = useState(() => {
    try {
      const saved = localStorage.getItem('aptCollapsed')
      return saved ? new Set(JSON.parse(saved)) : new Set()
    } catch {
      return new Set()
    }
  })

  const toggleCollapse = (propertyId) => {
    setCollapsed(prev => {
      const next = new Set(prev)
      if (next.has(propertyId)) next.delete(propertyId); else next.add(propertyId)
      localStorage.setItem('aptCollapsed', JSON.stringify([...next]))
      return next
    })
  }

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedRoomSearch(roomSearch); setRoomPage(0) }, 300)
    return () => clearTimeout(t)
  }, [roomSearch])

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedUnassignedSearch(unassignedSearch); setUnassignedPage(0) }, 300)
    return () => clearTimeout(t)
  }, [unassignedSearch])

  const load = () => {
    Promise.all([
      fetchPersonsPaginated({ userId: user.id, hasRoom: true, page: roomPage, pageSize: PAGE_SIZE, sortBy: roomSort.by, sortDir: roomSort.dir, search: debouncedRoomSearch }),
      fetchPersonsPaginated({ userId: user.id, hasRoom: false, page: unassignedPage, pageSize: PAGE_SIZE, sortBy: unassignedSort.by, sortDir: unassignedSort.dir, search: debouncedUnassignedSearch, includeInactive: true }),
      fetchRentObligations(user.id),
      fetchAllRooms(user.id),
      fetchPersons(user.id),
    ]).then(([roomRes, unassignedRes, r, allRooms, allActivePersons]) => {
      setRoomPersons(roomRes.data)
      setRoomPersonsCount(roomRes.count)
      setUnassignedPersons(unassignedRes.data)
      setUnassignedPersonsCount(unassignedRes.count)
      setRents(r)
      setRooms(allRooms)
      setAllPersons(allActivePersons)
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  useEffect(load, [user.id, roomPage, unassignedPage, roomSort.by, roomSort.dir, unassignedSort.by, unassignedSort.dir, debouncedRoomSearch, debouncedUnassignedSearch])

  const handleRoomSort = (column) => {
    if (column === roomSort.by) {
      setRoomSort({ ...roomSort, dir: roomSort.dir === 'asc' ? 'desc' : 'asc' })
    } else {
      setRoomSort({ by: column, dir: 'asc' })
    }
    setRoomPage(0)
  }

  const handleUnassignedSort = (column) => {
    if (column === unassignedSort.by) {
      setUnassignedSort({ ...unassignedSort, dir: unassignedSort.dir === 'asc' ? 'desc' : 'asc' })
    } else {
      setUnassignedSort({ by: column, dir: 'asc' })
    }
    setUnassignedPage(0)
  }

  const handleDeletePerson = async (id) => {
    await deletePerson(id); load()
  }

  const handleUpdatePerson = async (id, fields) => {
    await updatePerson(id, fields); load()
  }

  return (
    <div className="page-manage">
      <div className="page-header">
        <h1>Manage</h1>
        {/* <p className="page-subtitle">View and manage your properties, floors, rooms, and tenants</p> */}
      </div>

      {!loading && (() => {
        const expandedPersons = allPersons.filter(p => !p.property_id || !collapsed.has(p.property_id))
        const expandedRents = rents.filter(r => !r.property_id || !collapsed.has(r.property_id))
        return <StatsGrid persons={expandedPersons} rents={expandedRents} />
      })()}

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

      <div className="tab-content" key={activeTab}>
        {loading ? (
          <Loader />
        ) : (
          <>
            {activeTab === 'properties' && <VisualPropertyBuilder readOnly collapsed={collapsed} onToggleCollapse={toggleCollapse} onPersonChange={load} />}

            {activeTab === 'persons' && (
              <>
                <div style={{ marginBottom: '1rem' }}>
                  <DataTable
                    title="Current Tenants"
                    count={roomPersonsCount}
                    sortBy={roomSort.by}
                    sortDir={roomSort.dir}
                    onSort={handleRoomSort}
                    search={roomSearch}
                    onSearchChange={setRoomSearch}
                    columns={[
                      {
                        key: 'name',
                        label: 'Name',
                        sortKey: 'name',
                        render: p => (
                          <EditableCell
                            value={p.name}
                            onSave={name => handleUpdatePerson(p.id, { name })}
                          />
                        ),
                      },
                      {
                        key: 'location',
                        label: 'Location',
                        render: p => {
                          const parts = []
                          if (p.property?.name) parts.push(p.property.name)
                          if (p.floor?.name) parts.push(p.floor.name)
                          if (p.room?.name) parts.push(p.room.name)
                          return parts.length > 0
                            ? <span className="text-muted">{parts.join(' · ')}</span>
                            : <span className="text-muted">—</span>
                        },
                      },
                      {
                        key: 'phone',
                        label: 'Phone',
                        sortKey: 'phone',
                        render: p => p.phone
                          ? <span className="contact-chip"><Phone size={12} /> {p.phone}</span>
                          : <span className="text-muted">—</span>,
                      },
                      {
                        key: 'created_at',
                        label: 'Added Date',
                        sortKey: 'created_at',
                        render: p => p.created_at
                          ? <span className="text-muted" style={{ fontSize: 13 }}>{formatDateTime(p.created_at)}</span>
                          : <span className="text-muted">—</span>,
                      },
                      {
                        key: 'last_payment',
                        label: 'Last Payment',
                        render: p => {
                          const personRents = rents.filter(r => r.person_id === p.id)
                          const payments = personRents.flatMap(r => r.payments || []).sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date))
                          const last = payments[0]
                          if (!last) return <span className="text-muted">—</span>
                          return (
                            <span style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
                              <IndianRupee size={11} />
                              {last.amount}
                              <span className="text-muted" style={{ marginLeft: 4 }}>
                                {formatDateTime(last.payment_date)}
                              </span>
                            </span>
                          )
                        },
                      },
                    ]}
                    data={roomPersons}
                    loading={loading}
                    emptyMessage="No current tenants. Add one from Create page."
                    onRowClick={p => setSelectedPerson(p)}
                  />
                  {roomPersonsCount > PAGE_SIZE && (
                    <div className="pagination">
                      <button disabled={roomPage === 0} onClick={() => setRoomPage(roomPage - 1)}>Previous</button>
                      <span>Page {roomPage + 1} of {Math.ceil(roomPersonsCount / PAGE_SIZE)}</span>
                      <button disabled={(roomPage + 1) * PAGE_SIZE >= roomPersonsCount} onClick={() => setRoomPage(roomPage + 1)}>Next</button>
                    </div>
                  )}
                </div>

                <div className="dt-shell">
                  <button
                    className="dt-bar dt-bar--toggle"
                    onClick={() => setShowUnassigned(!showUnassigned)}
                  >
                    {showUnassigned ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    <span className="dt-title">Unassigned / Past</span>
                    <span className="dt-count">{unassignedPersonsCount}</span>
                  </button>
                  {showUnassigned && (
                    <>
                      <DataTable
                        sortBy={unassignedSort.by}
                        sortDir={unassignedSort.dir}
                        onSort={handleUnassignedSort}
                        search={unassignedSearch}
                        onSearchChange={setUnassignedSearch}
                        columns={[
                          {
                            key: 'name',
                            label: 'Name',
                            sortKey: 'name',
                            render: p => (
                              <EditableCell
                                value={p.name}
                                onSave={name => handleUpdatePerson(p.id, { name })}
                              />
                            ),
                          },
                          {
                            key: 'phone',
                            label: 'Phone',
                            sortKey: 'phone',
                            render: p => p.phone
                              ? <span className="contact-chip"><Phone size={12} /> {p.phone}</span>
                              : <span className="text-muted">—</span>,
                          },
                          {
                            key: 'created_at',
                            label: 'Added Date',
                            sortKey: 'created_at',
                            render: p => p.created_at
                              ? <span className="text-muted" style={{ fontSize: 13 }}>{formatDateTime(p.created_at)}</span>
                              : <span className="text-muted">—</span>,
                          },
                          {
                            key: 'last_payment',
                            label: 'Last Payment',
                            render: p => {
                              const personRents = rents.filter(r => r.person_id === p.id)
                              const payments = personRents.flatMap(r => r.payments || []).sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date))
                              const last = payments[0]
                              if (!last) return <span className="text-muted">—</span>
                              return (
                                <span style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <IndianRupee size={11} />
                                  {last.amount}
                                  <span className="text-muted" style={{ marginLeft: 4 }}>
                                    {formatDateTime(last.payment_date)}
                                  </span>
                                </span>
                              )
                            },
                          },
                        ]}
                        data={unassignedPersons}
                        loading={loading}
                        emptyMessage="No unassigned people."
                        onRowClick={p => setSelectedPerson(p)}
                      />
                      {unassignedPersonsCount > PAGE_SIZE && (
                        <div className="pagination">
                          <button disabled={unassignedPage === 0} onClick={() => setUnassignedPage(unassignedPage - 1)}>Previous</button>
                          <span>Page {unassignedPage + 1} of {Math.ceil(unassignedPersonsCount / PAGE_SIZE)}</span>
                          <button disabled={(unassignedPage + 1) * PAGE_SIZE >= unassignedPersonsCount} onClick={() => setUnassignedPage(unassignedPage + 1)}>Next</button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </>
            )}

            {activeTab === 'history' && <></>}
          </>
        )}
      </div>

      {selectedPerson && (
        <PersonDetailModal
          person={selectedPerson}
          userId={user.id}
          onClose={() => setSelectedPerson(null)}
          onPersonChange={load}
        />
      )}
    </div>
  )
}
