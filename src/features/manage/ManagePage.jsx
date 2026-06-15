import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthProvider'
import {
  fetchPersonsPaginated, fetchPersons, deletePerson, updatePerson,
  fetchRentObligations,
  fetchAllRooms,
  fetchEvents,
  logEvent,
} from '../../lib/rentals'
import { Building2, Users, Clock, X, Check, Phone, ChevronDown, ChevronUp, IndianRupee, Plus, Trash2, DoorOpen, Bed, User, LogOut, RotateCcw, Undo2, Search } from 'lucide-react'
import { formatDateTime } from '../../lib/dates'
import VisualPropertyBuilder from '../../components/ui/VisualPropertyBuilder'
import DataTable from '../../components/ui/DataTable'
import PersonDetailModal from '../../components/ui/PersonDetailModal'
import Loader from '../../components/ui/Loader'
import DatePicker from '../../components/ui/DatePicker'

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

function StatsGrid({ persons }) {
  const roomPersons = persons.filter(p => p.room_id)
  const filledBeds = roomPersons.filter(p => p.name?.trim()).length
  const emptyBeds = roomPersons.filter(p => !p.name?.trim()).length

  return (
    <div className="stats-grid">
      <StatCard icon={Users} label="Filled" value={filledBeds} accent="success" />
      <StatCard icon={Users} label="Empty" value={emptyBeds} accent="warning" />
    </div>
  )
}

export default function ManagePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
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
  const [events, setEvents] = useState([])
  const [eventsCount, setEventsCount] = useState(0)
  const [eventsPage, setEventsPage] = useState(0)
  const [eventsLoading, setEventsLoading] = useState(false)
  const [eventsSearch, setEventsSearch] = useState('')
  const [eventsFromDate, setEventsFromDate] = useState('')
  const [eventsToDate, setEventsToDate] = useState('')
  const [debouncedEventsSearch, setDebouncedEventsSearch] = useState('')
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

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedEventsSearch(eventsSearch); setEventsPage(0) }, 300)
    return () => clearTimeout(t)
  }, [eventsSearch])

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

  useEffect(load, [user.id, roomPage, unassignedPage, roomSort.by, roomSort.dir, unassignedSort.by, unassignedSort.dir, debouncedRoomSearch, debouncedUnassignedSearch, activeTab])

  const fetchEventsData = (page) => {
    setEventsLoading(true)
    fetchEvents(user.id, { limit: 50, offset: page * 50, fromDate: eventsFromDate || undefined, toDate: eventsToDate || undefined, search: debouncedEventsSearch || undefined })
      .then(({ data, count }) => {
        setEvents(data)
        setEventsCount(count)
        setEventsLoading(false)
      })
      .catch(() => setEventsLoading(false))
  }

  useEffect(() => {
    if (activeTab !== 'history') return
    setEventsPage(0)
    fetchEventsData(0)
  }, [user.id, activeTab, eventsFromDate, eventsToDate, debouncedEventsSearch])

  useEffect(() => {
    if (activeTab !== 'history') return
    if (eventsPage === 0) return
    fetchEventsData(eventsPage)
  }, [user.id, activeTab, eventsPage])

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
    const p = [...roomPersons, ...unassignedPersons].find(p => p.id === id)
    if (fields.name && p?.name !== fields.name) {
      logEvent({ userId: user.id, propertyId: p?.property_id, personId: id, eventType: 'person_updated', description: `"${fields.name}" name updated` }).catch(() => { })
    }
  }

  return (
    <div className="page-manage">
      {/* <div className="page-header">
        <h1>Manage</h1>
        <p className="page-subtitle">View and manage your properties, floors, rooms, and tenants</p>
      </div> */}

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
            {activeTab === 'properties' && (
              rooms.length === 0 && !loading
                ? (
                  <div className="pb-empty-state">
                    <Building2 size={40} className="pb-empty-icon" />
                    <h3>No properties yet</h3>
                    <p>Create your first property to start managing tenants and rent.</p>
                    <button className="pb-empty-btn" onClick={() => navigate('/create')}>
                      <Plus size={18} /> Create Property
                    </button>
                  </div>
                )
                : <VisualPropertyBuilder readOnly collapsed={collapsed} onToggleCollapse={toggleCollapse} onPersonChange={load} />
            )}

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

            {activeTab === 'history' && (
              <div className="ev-table-wrapper">
                <div className="ev-filters">
                  <div className="ev-search">
                    <Search size={14} />
                    <input type="text" value={eventsSearch} onChange={e => setEventsSearch(e.target.value)} placeholder="Search events..." />
                  </div>
                  <div className="ev-date-range">
                    <DatePicker value={eventsFromDate} onChange={e => setEventsFromDate(e.target.value)} placeholderText="From date" />
                    <span className="ev-date-sep">—</span>
                    <DatePicker value={eventsToDate} onChange={e => setEventsToDate(e.target.value)} placeholderText="To date" />
                  </div>
                </div>
                <DataTable
                  title="Event History"
                  count={eventsCount}
                  columns={[
                    {
                      key: 'icon',
                      label: '',
                      className: 'ev-col-icon',
                      render: e => {
                        const iconMap = {
                          property_created: Building2,
                          property_updated: Building2,
                          property_deleted: Building2,
                          floor_created: DoorOpen,
                          floor_updated: DoorOpen,
                          floor_deleted: DoorOpen,
                          room_created: DoorOpen,
                          room_updated: DoorOpen,
                          room_deleted: DoorOpen,
                          person_added: User,
                          person_updated: User,
                          person_deactivated: User,
                          person_removed: User,
                          person_checked_out: LogOut,
                          payment_made: IndianRupee,
                          payment_reverted: Undo2,
                          payment_cancelled: RotateCcw,
                        }
                        const Icon = iconMap[e.event_type] || Clock
                        return <Icon size={12} className="ev-icon" />
                      },
                    },
                    {
                      key: 'description',
                      label: 'Event',
                      className: 'ev-col-desc',
                      render: e => (
                        <div className="ev-desc">
                          <span className="ev-text">{e.description}</span>
                          {e.property?.name && <span className="ev-property">{e.property.name}</span>}
                        </div>
                      ),
                    },
                    {
                      key: 'event_type',
                      label: 'Type',
                      className: 'ev-col-type',
                      render: e => {
                        const labels = {
                          property_created: 'Created',
                          property_updated: 'Renamed',
                          property_deleted: 'Deleted',
                          floor_created: 'Floors',
                          floor_updated: 'Floors',
                          floor_deleted: 'Floors',
                          room_created: 'Rooms',
                          room_updated: 'Rooms',
                          room_deleted: 'Rooms',
                          person_added: 'People',
                          person_updated: 'People',
                          person_deactivated: 'People',
                          person_removed: 'People',
                          person_checked_out: 'Checkout',
                          payment_made: 'Payment',
                          payment_reverted: 'Payment',
                          payment_cancelled: 'Payment',
                        }
                        return <span className="ev-type">{labels[e.event_type] || e.event_type}</span>
                      },
                    },
                    {
                      key: 'created_at',
                      label: 'Date & Time',
                      className: 'ev-col-time',
                      render: e => (
                        <span className="ev-time">{formatDateTime(e.created_at)}</span>
                      ),
                    },
                  ]}
                  data={events}
                  loading={eventsLoading}
                  emptyMessage="No events yet."
                />
                {eventsCount > 50 && (
                  <div className="pagination">
                    <button disabled={eventsPage === 0} onClick={() => setEventsPage(eventsPage - 1)}>Previous</button>
                    <span>Page {eventsPage + 1} of {Math.ceil(eventsCount / 50)}</span>
                    <button disabled={(eventsPage + 1) * 50 >= eventsCount} onClick={() => setEventsPage(eventsPage + 1)}>Next</button>
                  </div>
                )}
              </div>
            )}
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
