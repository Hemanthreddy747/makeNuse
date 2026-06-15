import { useState, useEffect, useRef } from 'react'
import { Plus, Trash2, Building2, Bed, DoorOpen, Maximize2, Minimize2, IndianRupee } from 'lucide-react'
import { useAuth } from '../../context/AuthProvider'
import { useConfirm } from '../../context/ConfirmContext'
import PersonDetailModal from './PersonDetailModal'
import Loader from './Loader'
import {
  fetchProperties, createProperty, deleteProperty, updateProperty,
  fetchAllFloors, createFloor, deleteFloor, updateFloor,
  fetchAllRooms, createRoom, deleteRoom, updateRoom,
  fetchPersonsWithRooms, createPerson,
  logEvent,
} from '../../lib/rentals'

function InlineEdit({ value, onSave, readOnly, autoEdit, onAutoEditEnd }) {
  const [editing, setEditing] = useState(autoEdit)
  const [val, setVal] = useState(value)
  const inputRef = useRef(null)

  useEffect(() => { setVal(value) }, [value])

  useEffect(() => {
    if (autoEdit) setEditing(true)
  }, [autoEdit])

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.select()
  }, [editing])

  const endEdit = () => {
    setEditing(false)
    if (onAutoEditEnd) onAutoEditEnd()
  }

  const submit = () => {
    const trimmed = val.trim()
    if (trimmed && trimmed !== value) {
      onSave(trimmed)
    } else {
      setVal(value)
    }
    endEdit()
  }

  if (readOnly) {
    return <span className="pb-label">{value}</span>
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        className="pb-input"
        value={val}
        onChange={e => setVal(e.target.value)}
        onBlur={submit}
        onKeyDown={e => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') { setVal(value); endEdit() } }}
        autoFocus
      />
    )
  }

  return (
    <span className="pb-label" onClick={() => setEditing(true)} title="Click to edit">
      {value}
    </span>
  )
}

function RoomCard({ room, persons, onOpenPerson, onAddPerson, onUpdateRoom, onDeleteRoom, readOnly, autoEditId, onAutoEditEnd }) {
  const roomPersons = persons
    .filter(p => p.room_id === room.id)
    .sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0))

  return (
    <div className="pb-room-card">
      <div className="pb-room-header">
        <DoorOpen size={15} className="pb-room-icon" />
        <InlineEdit value={room.name} onSave={name => onUpdateRoom(room.id, name)} readOnly={readOnly} autoEdit={room.id === autoEditId} onAutoEditEnd={onAutoEditEnd} />
        {roomPersons.length > 0 && roomPersons[0].rent_amount && (
          <span className="pb-room-rent">
            <IndianRupee size={11} />{roomPersons[0].rent_amount}
          </span>
        )}
        {!readOnly && (
          <button className="pb-icon-btn pb-icon-btn--del" onClick={() => onDeleteRoom(room.id)} title="Delete room">
            <Trash2 size={12} />
          </button>
        )}
      </div>
      <div className="pb-beds">
        {roomPersons.map(person => (
          <div
            key={person.id}
            className={`pb-bed${!person.name || !person.is_active ? ' pb-bed--empty' : ''}`}
            onClick={() => onOpenPerson(person.id)}
            title="Click to manage"
          >
            <Bed size={13} className="pb-bed-icon" />
            <span className="pb-bed-label">
              {person.name && person.is_active ? person.name : 'Available'}
            </span>
          </div>
        ))}
        {!readOnly && (
          <button className="pb-add-bed" onClick={() => onAddPerson(room.property_id, room.floor_id, room.id)} title="Add person">
            <Plus size={12} /> Bed
          </button>
        )}
      </div>
    </div>
  )
}

function FloorSection({ floor, rooms, persons, onOpenPerson, onAddPerson, onUpdateRoom, onDeleteRoom, onDeleteFloor, onAddRoom, onUpdateFloor, readOnly, autoEditId, onAutoEditEnd }) {
  const floorRooms = rooms.filter(r => r.floor_id === floor.id)

  return (
    <div className="pb-floor">
      <div className="pb-floor-title">
        <InlineEdit value={floor.name} onSave={name => onUpdateFloor(floor.id, name)} readOnly={readOnly} autoEdit={floor.id === autoEditId} onAutoEditEnd={onAutoEditEnd} />
        <span className="pb-floor-count">{floorRooms.length} room{floorRooms.length !== 1 ? 's' : ''}</span>
        {!readOnly && (
          <button className="pb-icon-btn pb-icon-btn--del" onClick={() => onDeleteFloor(floor.id)} title="Delete floor">
            <Trash2 size={13} />
          </button>
        )}
      </div>
      <div className="pb-rooms-grid">
        {floorRooms.map(room => (
          <RoomCard
            key={room.id}
            room={room}
            persons={persons}
            onOpenPerson={onOpenPerson}
            onAddPerson={onAddPerson}
            onUpdateRoom={onUpdateRoom}
            onDeleteRoom={onDeleteRoom}
            readOnly={readOnly}
            autoEditId={autoEditId}
            onAutoEditEnd={onAutoEditEnd}
          />
        ))}
        {!readOnly && (
          <button className="pb-add-room" onClick={() => onAddRoom(floor.property_id, floor.id)} title="Add room">
            <Plus size={16} /> Room
          </button>
        )}
      </div>
    </div>
  )
}

export default function VisualPropertyBuilder({ readOnly = false, collapsed: collapsedProp, onToggleCollapse, onPersonChange }) {
  const { user } = useAuth()
  const confirm = useConfirm()
  const [properties, setProperties] = useState([])
  const [floors, setFloors] = useState([])
  const [rooms, setRooms] = useState([])
  const [persons, setPersons] = useState([])
  const [loading, setLoading] = useState(true)
  const [autoEditId, setAutoEditId] = useState(null)
  const [selectedPerson, setSelectedPerson] = useState(null)

  const clearAutoEditId = () => setAutoEditId(null)

  const hasExternalCollapse = collapsedProp !== undefined
  const [internalCollapsed, setInternalCollapsed] = useState(() => {
    try {
      const saved = localStorage.getItem('aptCollapsed')
      return saved ? new Set(JSON.parse(saved)) : new Set()
    } catch {
      return new Set()
    }
  })

  const collapsed = hasExternalCollapse ? collapsedProp : internalCollapsed
  const toggleCollapse = hasExternalCollapse
    ? onToggleCollapse
    : (propertyId) => {
      setInternalCollapsed(prev => {
        const next = new Set(prev)
        if (next.has(propertyId)) next.delete(propertyId); else next.add(propertyId)
        localStorage.setItem('aptCollapsed', JSON.stringify([...next]))
        return next
      })
    }

  const load = () => {
    Promise.all([
      fetchProperties(user.id),
      fetchAllFloors(user.id),
      fetchAllRooms(user.id),
      fetchPersonsWithRooms(user.id),
    ]).then(([p, f, r, pe]) => {
      setProperties(p)
      setFloors(f)
      setRooms(r)
      setPersons(pe)
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  useEffect(load, [user.id])

  const handleOpenPerson = (personId) => {
    const person = persons.find(p => p.id === personId)
    if (person) setSelectedPerson(person)
  }

  const handlePersonChange = () => {
    load()
    if (onPersonChange) onPersonChange()
  }

  const handleAddProperty = async () => {
    const data = await createProperty({ userId: user.id, name: 'New Property', type: 'pg', address: '' })
    setProperties(prev => [...prev, data])
    setAutoEditId(data.id)
    logEvent({ userId: user.id, propertyId: data.id, eventType: 'property_created', description: `Property "${data.name}" created` }).catch(() => { })
  }
  const handleUpdateProperty = async (id, name) => {
    const old = properties.find(p => p.id === id)
    await updateProperty(id, { name })
    setProperties(prev => prev.map(p => p.id === id ? { ...p, name } : p))
    logEvent({ userId: user.id, propertyId: id, eventType: 'property_updated', description: `Property renamed from "${old?.name}" to "${name}"` }).catch(() => { })
  }
  const handleDeleteProperty = async (id) => {
    const ok = await confirm('Delete this property and everything under it?')
    if (!ok) return
    const prop = properties.find(p => p.id === id)
    await deleteProperty(id)
    setProperties(prev => prev.filter(p => p.id !== id))
    setFloors(prev => prev.filter(f => f.property_id !== id))
    setRooms(prev => prev.filter(r => r.property_id !== id))
    setPersons(prev => prev.filter(p => p.property_id !== id))
    logEvent({ userId: user.id, propertyId: id, eventType: 'property_deleted', description: `Property "${prop?.name}" deleted` }).catch(() => { })
  }

  const [demoLoading, setDemoLoading] = useState(false)
  const [demoDismissed, setDemoDismissed] = useState(false)
  const [demoPropName, setDemoPropName] = useState('Vikram PG')
  const [demoFloorsData, setDemoFloorsData] = useState([
    { id: '__df2__', name: 'Floor-2', rooms: ['Room-201', 'Room-202', 'Room-203'] },
    { id: '__df1__', name: 'Floor-1', rooms: ['Room-101', 'Room-102', 'Room-103'] },
  ])

  const updateDemoFloorName = (floorId, name) => {
    setDemoFloorsData(prev => prev.map(f => f.id === floorId ? { ...f, name } : f))
  }

  const updateDemoRoomName = (floorId, index, name) => {
    setDemoFloorsData(prev => prev.map(f =>
      f.id === floorId
        ? { ...f, rooms: f.rooms.map((r, i) => i === index ? name : r) }
        : f
    ))
  }

  const demoHandleClick = async (action) => {
    setDemoLoading(true)
    try {
      const prop = await createProperty({ userId: user.id, name: demoPropName, type: 'pg', address: '' })
      const floors = []
      const rooms = []
      for (const f of demoFloorsData) {
        const floor = await createFloor({ userId: user.id, propertyId: prop.id, name: f.name })
        floors.push(floor)
        for (const rn of f.rooms) {
          const room = await createRoom({ userId: user.id, propertyId: prop.id, floorId: floor.id, name: rn })
          rooms.push(room)
        }
      }
      let person = null
      if (action === 'addPerson') {
        person = await createPerson({ userId: user.id, propertyId: prop.id, floorId: floors[0].id, roomId: rooms[0].id, name: '', phone: '' })
      }
      setProperties([prop])
      setFloors(floors)
      setRooms(rooms)
      if (person) {
        setPersons([person])
        setSelectedPerson(person)
      }
    } finally {
      setDemoLoading(false)
    }
  }

  const demoHandleDismiss = () => setDemoDismissed(true)

  const handleAddFloor = async (propertyId) => {
    const data = await createFloor({ userId: user.id, propertyId, name: 'New Floor' })
    setFloors(prev => [data, ...prev])
    setAutoEditId(data.id)
    const prop = properties.find(p => p.id === propertyId)
    logEvent({ userId: user.id, propertyId, eventType: 'floor_created', description: `Floor "${data.name}" added in "${prop?.name}"` }).catch(() => { })
  }
  const handleUpdateFloor = async (id, name) => {
    const old = floors.find(f => f.id === id)
    await updateFloor(id, { name })
    setFloors(prev => prev.map(f => f.id === id ? { ...f, name } : f))
    const prop = properties.find(p => p.id === old?.property_id)
    logEvent({ userId: user.id, propertyId: old?.property_id, eventType: 'floor_updated', description: `Floor renamed from "${old?.name}" to "${name}" in "${prop?.name}"` }).catch(() => { })
  }
  const handleDeleteFloor = async (id) => {
    const ok = await confirm('Delete this floor and its rooms?')
    if (!ok) return
    const floor = floors.find(f => f.id === id)
    await deleteFloor(id)
    setFloors(prev => prev.filter(f => f.id !== id))
    setRooms(prev => prev.filter(r => r.floor_id !== id))
    setPersons(prev => prev.filter(p => p.floor_id !== id))
    const prop = properties.find(p => p.id === floor?.property_id)
    logEvent({ userId: user.id, propertyId: floor?.property_id, eventType: 'floor_deleted', description: `Floor "${floor?.name}" deleted from "${prop?.name}"` }).catch(() => { })
  }

  const handleAddRoom = async (propertyId, floorId) => {
    const data = await createRoom({ userId: user.id, propertyId, floorId, name: 'New Room' })
    setRooms(prev => [...prev, data])
    setAutoEditId(data.id)
    const prop = properties.find(p => p.id === propertyId)
    logEvent({ userId: user.id, propertyId, eventType: 'room_created', description: `Room "${data.name}" added in "${prop?.name}"` }).catch(() => { })
  }
  const handleUpdateRoom = async (id, name) => {
    const old = rooms.find(r => r.id === id)
    await updateRoom(id, { name })
    setRooms(prev => prev.map(r => r.id === id ? { ...r, name } : r))
    const prop = properties.find(p => p.id === old?.property_id)
    logEvent({ userId: user.id, propertyId: old?.property_id, eventType: 'room_updated', description: `Room renamed from "${old?.name}" to "${name}" in "${prop?.name}"` }).catch(() => { })
  }
  const handleDeleteRoom = async (id) => {
    const ok = await confirm('Delete this room?')
    if (!ok) return
    const room = rooms.find(r => r.id === id)
    await deleteRoom(id)
    setRooms(prev => prev.filter(r => r.id !== id))
    setPersons(prev => prev.filter(p => p.room_id !== id))
    const prop = properties.find(p => p.id === room?.property_id)
    logEvent({ userId: user.id, propertyId: room?.property_id, eventType: 'room_deleted', description: `Room "${room?.name}" deleted from "${prop?.name}"` }).catch(() => { })
  }

  const handleAddPerson = async (propertyId, floorId, roomId) => {
    const data = await createPerson({ userId: user.id, propertyId, floorId, roomId, name: '', phone: '' })
    setPersons(prev => [...prev, data])
    const prop = properties.find(p => p.id === propertyId)
    logEvent({ userId: user.id, propertyId, personId: data.id, eventType: 'person_added', description: `Bed added in "${prop?.name}"` }).catch(() => { })
  }
  if (loading) return <Loader />

  return (
    <div className="pb">

      <div className="pb-list">
        {!readOnly && properties.length === 0 && !demoDismissed && (
          <div className="pb-card pb-card--demo">
            <div className="pb-card-header">
              <div className="pb-card-header-left">
                <Building2 size={18} className="pb-card-icon" />
                <InlineEdit value={demoPropName} onSave={setDemoPropName} />
                <span className="pb-badge">Quick Start</span>
              </div>
              <div className="pb-card-header-right">
                <span className="pb-meta">{demoFloorsData.length} floors</span>
                <button className="pb-icon-btn pb-icon-btn--del" onClick={demoHandleDismiss} title="Dismiss">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <div className={`pb-card-body${demoLoading ? ' pb-loading' : ''}`}>
              {demoLoading && (
                <div className="pb-demo-loader">
                  <div className="loader loader-sm" />
                  <span>Importing...</span>
                </div>
              )}
              <button className="pb-add-floor" onClick={() => demoHandleClick()} disabled={demoLoading} title="Import demo">
                <Plus size={16} /> Add Floor
              </button>
              {demoFloorsData.map(floor => (
                <div key={floor.id} className={`pb-floor pb-floor--demo${demoLoading ? ' pb-disabled' : ''}`}>
                  <div className="pb-floor-title">
                    <InlineEdit value={floor.name} onSave={name => updateDemoFloorName(floor.id, name)} />
                    <span className="pb-floor-count">{floor.rooms.length} rooms</span>
                  </div>
                  <div className="pb-rooms-grid">
                    {floor.rooms.map((room, ri) => (
                      <div key={room} className={`pb-room-card pb-room-card--demo${demoLoading ? ' pb-disabled' : ''}`}>
                        <div className="pb-room-header">
                          <DoorOpen size={15} className="pb-room-icon" />
                          <InlineEdit value={room} onSave={name => updateDemoRoomName(floor.id, ri, name)} />
                        </div>
                        <div className="pb-beds">
                          {[1, 2].map(i => (
                            <div key={i} className="pb-bed pb-bed--empty" onClick={demoLoading ? undefined : () => demoHandleClick('addPerson')} title="Add occupant">
                              <Bed size={13} className="pb-bed-icon" />
                              <span className="pb-bed-label">Available</span>
                            </div>
                          ))}
                          <button className="pb-add-bed" onClick={demoLoading ? undefined : () => demoHandleClick('addPerson')} disabled={demoLoading} title="Add person">
                            <Plus size={12} /> Bed
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {properties.map(property => {
          const propertyFloors = floors.filter(f => f.property_id === property.id)

          return (
            <div key={property.id} className="pb-card">
              <div className="pb-card-header" onClick={() => toggleCollapse(property.id)}>
                <div className="pb-card-header-left">
                  <Building2 size={18} className="pb-card-icon" />
                  <InlineEdit value={property.name} onSave={name => handleUpdateProperty(property.id, name)} readOnly={readOnly} autoEdit={property.id === autoEditId} onAutoEditEnd={clearAutoEditId} />
                </div>
                <div className="pb-card-header-right">
                  <span className="pb-meta">{propertyFloors.length} floor{propertyFloors.length !== 1 ? 's' : ''}</span>
                  <button
                    className="pb-icon-btn pb-collapse-btn"
                    onClick={e => { e.stopPropagation(); toggleCollapse(property.id) }}
                    title={collapsed.has(property.id) ? 'Expand' : 'Collapse'}
                  >
                    {collapsed.has(property.id) ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
                  </button>
                  {!readOnly && (
                    <button className="pb-icon-btn pb-icon-btn--del" onClick={e => { e.stopPropagation(); handleDeleteProperty(property.id) }} title="Delete property">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>

              {!collapsed.has(property.id) && (
                <div className="pb-card-body">
                  {!readOnly && (
                    <button className="pb-add-floor" onClick={() => handleAddFloor(property.id)} title="Add floor">
                      <Plus size={16} /> Add Floor
                    </button>
                  )}
                  {propertyFloors.map(floor => (
                    <FloorSection
                      key={floor.id}
                      floor={floor}
                      rooms={rooms}
                      persons={persons}
                      onOpenPerson={handleOpenPerson}
                      onAddPerson={handleAddPerson}
                      onUpdateFloor={handleUpdateFloor}
                      onDeleteFloor={handleDeleteFloor}
                      onAddRoom={handleAddRoom}
                      onUpdateRoom={handleUpdateRoom}
                      onDeleteRoom={handleDeleteRoom}
                      readOnly={readOnly}
                      autoEditId={autoEditId}
                      onAutoEditEnd={clearAutoEditId}
                    />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {!readOnly && (
        <button className="pb-add-property" onClick={handleAddProperty}>
          <Plus size={20} /> Add Property
        </button>
      )}

      {selectedPerson && (
        <PersonDetailModal
          person={selectedPerson}
          userId={user.id}
          onClose={() => setSelectedPerson(null)}
          onPersonChange={handlePersonChange}
        />
      )}
    </div>
  )
}
