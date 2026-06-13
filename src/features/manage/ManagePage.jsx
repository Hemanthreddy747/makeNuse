import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthProvider'
import {
  fetchPersonsPaginated, fetchPersons, deletePerson, updatePerson,
  fetchRentObligations, cancelRentObligation, updateRentObligation, createRentPayment,
  fetchAllRooms,
} from '../../lib/rentals'
import { Building2, Users, Receipt, Clock, Trash2, X, Check, Phone, Mail, Filter, ChevronDown, ChevronUp, IndianRupee, Home } from 'lucide-react'
import { useConfirm } from '../../context/ConfirmContext'
import { formatDateTime } from '../../lib/dates'
import VisualPropertyBuilder from '../../components/ui/VisualPropertyBuilder'
import DataTable from '../../components/ui/DataTable'
import PersonDetailModal from '../../components/ui/PersonDetailModal'
import Loader from '../../components/ui/Loader'

const tabs = [
  { key: 'properties', label: 'Properties', icon: Building2 },
  { key: 'persons', label: 'People', icon: Users },
  { key: 'rents', label: 'Rents', icon: Receipt },
  { key: 'history', label: 'History', icon: Clock },
]

const RENT_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'paid', label: 'Paid' },
  { key: 'overdue', label: 'Overdue' },
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
  const [roomSort, setRoomSort] = useState({ by: 'move_in_date', dir: 'desc' })
  const [roomSearch, setRoomSearch] = useState('')
  const [unassignedPersons, setUnassignedPersons] = useState([])
  const [unassignedPersonsCount, setUnassignedPersonsCount] = useState(0)
  const [unassignedPage, setUnassignedPage] = useState(0)
  const [unassignedSort, setUnassignedSort] = useState({ by: 'move_in_date', dir: 'desc' })
  const [unassignedSearch, setUnassignedSearch] = useState('')
  const [rents, setRents] = useState([])
  const [rentFilter, setRentFilter] = useState('all')
  const [rooms, setRooms] = useState([])
  const [allPersons, setAllPersons] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPerson, setSelectedPerson] = useState(null)
  const [showUnassigned, setShowUnassigned] = useState(false)
  const PAGE_SIZE = 50
  const confirm = useConfirm()
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
    setLoading(true)
    Promise.all([
      fetchPersonsPaginated({ userId: user.id, hasRoom: true, page: roomPage, pageSize: PAGE_SIZE, sortBy: roomSort.by, sortDir: roomSort.dir, search: debouncedRoomSearch }),
      fetchPersonsPaginated({ userId: user.id, hasRoom: false, page: unassignedPage, pageSize: PAGE_SIZE, sortBy: unassignedSort.by, sortDir: unassignedSort.dir, search: debouncedUnassignedSearch }),
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
  const handleDeleteRent = async (id) => {
    await cancelRentObligation(id); load()
  }

  const handleUpdatePerson = async (id, fields) => {
    await updatePerson(id, fields); load()
  }
  const handleUpdateRent = async (id, fields) => {
    if (fields.status === 'paid') {
      const obligation = rents.find(r => r.id === id)
      if (obligation) {
        await createRentPayment({
          obligationId: id,
          personId: obligation.person_id,
          propertyId: obligation.property_id,
          amount: obligation.amount,
          paymentDate: fields.paid_date || new Date().toISOString(),
        })
      }
    }
    await updateRentObligation(id, fields); load()
  }

  const filteredRents = rentFilter === 'all'
    ? rents.filter(r => r.status !== 'cancelled')
    : rents.filter(r => r.status === rentFilter)

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
            {activeTab === 'properties' && <VisualPropertyBuilder readOnly collapsed={collapsed} onToggleCollapse={toggleCollapse} />}

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
                        key: 'status',
                        label: 'Status',
                        render: p => {
                          const personRents = rents.filter(r => r.person_id === p.id)
                          if (personRents.length === 0) return <span className="text-muted">—</span>
                          const hasOverdue = personRents.some(r => r.status === 'overdue')
                          const hasPending = personRents.some(r => r.status === 'pending')
                          const allPaid = personRents.every(r => r.status === 'paid')
                          if (hasOverdue) return <span className="rent-status rent-status-overdue">Overdue</span>
                          if (hasPending) return <span className="rent-status rent-status-pending">Pending</span>
                          if (allPaid) return <span className="rent-status rent-status-paid">Paid</span>
                          return <span className="rent-status rent-status-pending">Mixed</span>
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

            {activeTab === 'rents' && (
              <>
                <div className="filter-bar">
                  {RENT_FILTERS.map(f => (
                    <button
                      key={f.key}
                      className={`filter-btn${rentFilter === f.key ? ' active' : ''}`}
                      onClick={() => setRentFilter(f.key)}
                    >
                      <Filter size={14} />
                      {f.label}
                    </button>
                  ))}
                </div>

                <DataTable
                  columns={[
                    {
                      key: 'person',
                      label: 'Person',
                      render: r => (
                        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.3 }}>
                          <strong>{r.person?.name || 'Unknown'}</strong>
                          <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{r.person?.room_no ? `Room ${r.person.room_no}` : ''}</span>
                        </div>
                      ),
                    },
                    {
                      key: 'property',
                      label: 'Property',
                      render: r => r.property?.name || <span className="text-muted">—</span>,
                    },
                    {
                      key: 'amount',
                      label: 'Amount',
                      render: r => <span>{'\u20B9'}{r.amount}</span>,
                    },
                    {
                      key: 'paid_date',
                      label: 'Paid On',
                      render: r => {
                        const latest = (r.payments || []).slice(-1)[0]
                        return latest?.payment_date
                          ? formatDateTime(latest.payment_date)
                          : <span className="text-muted">—</span>
                      },
                    },
                    {
                      key: 'created_at',
                      label: 'Created',
                      render: r => r.created_at ? formatDateTime(r.created_at) : <span className="text-muted">—</span>,
                    },
                    {
                      key: 'status',
                      label: 'Status',
                      render: r => {
                        const cls = `rent-status rent-status-${r.status}`
                        return <span className={cls}>{r.status}</span>
                      },
                    },
                  ]}
                  data={filteredRents}
                  loading={loading}
                  emptyMessage={`No ${rentFilter !== 'all' ? rentFilter : ''} rents found. Add one from Create page.`}
                  rowActions={r => (
                    <>
                      {r.status !== 'paid' && r.status !== 'cancelled' && (
                        <button className="icon-btn success" onClick={e => { e.stopPropagation(); handleUpdateRent(r.id, { status: 'paid', paid_date: new Date().toISOString() }) }} title="Mark paid"><Check size={14} /></button>
                      )}
                      {r.status === 'paid' && (
                        <button className="icon-btn" onClick={e => { e.stopPropagation(); handleUpdateRent(r.id, { status: 'pending' }) }} title="Revert"><X size={14} /></button>
                      )}
                      {r.status !== 'cancelled' && (
                        <button className="icon-btn danger" onClick={async e => { e.stopPropagation(); const ok = await confirm('Cancel this rent obligation?'); if (ok) handleDeleteRent(r.id) }}><Trash2 size={14} /></button>
                      )}
                    </>
                  )}
                />
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
