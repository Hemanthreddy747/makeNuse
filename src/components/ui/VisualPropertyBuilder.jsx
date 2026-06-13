import { useState, useEffect, useRef } from 'react'
import { Plus, Trash2, Building2, Bed, DoorOpen, ChevronDown, User } from 'lucide-react'
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
    return <span className="vi-label">{value}</span>
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        className="vi-input"
        value={val}
        onChange={e => setVal(e.target.value)}
        onBlur={submit}
        onKeyDown={e => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') { setVal(value); endEdit() } }}
        autoFocus
      />
    )
  }

  return (
    <span className="vi-label" onClick={() => setEditing(true)} title="Click to edit">
      {value}
    </span>
  )
}

function RoomCard({ room, persons, onOpenPerson, onAddPerson, onUpdateRoom, onDeleteRoom, readOnly, autoEditId, onAutoEditEnd }) {
  const roomPersons = persons
    .filter(p => p.room_id === room.id)
    .sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0))

  return (
    <div className="apt-room">
      <div className="apt-room-head">
        <DoorOpen size={16} className="apt-room-icon" />
        <InlineEdit value={room.name} onSave={name => onUpdateRoom(room.id, name)} readOnly={readOnly} autoEdit={room.id === autoEditId} onAutoEditEnd={onAutoEditEnd} />
        {!readOnly && (
          <button className="apt-icon-btn apt-icon-btn--del" onClick={() => onDeleteRoom(room.id)} title="Delete room">
            <Trash2 size={13} />
          </button>
        )}
      </div>
      <div className="apt-beds">
        {roomPersons.map(person => (
          <div
            key={person.id}
            className={`apt-bed${!person.name || !person.is_active ? ' apt-bed--empty' : ''}`}
            onClick={() => onOpenPerson(person.id)}
            title="Click to manage"
          >
            {!person.name || !person.is_active ? <Bed size={14} className="apt-bed-icon" /> : <User size={14} className="apt-bed-icon" />}
            <span className="vi-label">{person.name && person.is_active ? person.name : 'Empty'}</span>
          </div>
        ))}
        {!readOnly && (
          <button className="apt-add-bed" onClick={() => onAddPerson(room.property_id, room.floor_id, room.id)} title="Add person">
            <Plus size={13} /> Bed
          </button>
        )}
      </div>
    </div>
  )
}

function FloorSection({ floor, rooms, persons, onOpenPerson, onAddPerson, onUpdateRoom, onDeleteRoom, onDeleteFloor, onAddRoom, onUpdateFloor, readOnly, autoEditId, onAutoEditEnd }) {
  const floorRooms = rooms.filter(r => r.floor_id === floor.id)

  return (
    <div className="apt-floor">
      <div className="apt-floor-label">
        <span className="apt-floor-dot" />
        <InlineEdit value={floor.name} onSave={name => onUpdateFloor(floor.id, name)} readOnly={readOnly} autoEdit={floor.id === autoEditId} onAutoEditEnd={onAutoEditEnd} />
        <span className="apt-floor-count">{floorRooms.length} room{floorRooms.length !== 1 ? 's' : ''}</span>
        {!readOnly && (
          <button className="apt-icon-btn apt-icon-btn--del" onClick={() => onDeleteFloor(floor.id)} title="Delete floor">
            <Trash2 size={14} />
          </button>
        )}
      </div>
      <div className="apt-units">
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
          <button className="apt-add-unit" onClick={() => onAddRoom(floor.property_id, floor.id)} title="Add room">
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
    logEvent({ userId: user.id, propertyId: data.id, eventType: 'property_created', description: `Property "${data.name}" created` }).catch(() => {})
  }
  const handleUpdateProperty = async (id, name) => {
    const old = properties.find(p => p.id === id)
    await updateProperty(id, { name })
    setProperties(prev => prev.map(p => p.id === id ? { ...p, name } : p))
    logEvent({ userId: user.id, propertyId: id, eventType: 'property_updated', description: `Property renamed from "${old?.name}" to "${name}"` }).catch(() => {})
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
    logEvent({ userId: user.id, propertyId: id, eventType: 'property_deleted', description: `Property "${prop?.name}" deleted` }).catch(() => {})
  }

  const demoProp = { id: '__demo__', name: 'My Property', type: 'pg' }
  const demoFloors = [{ id: '__df1__', property_id: '__demo__', name: 'Floor 1' }]
  const demoRooms = [{ id: '__dr1__', property_id: '__demo__', floor_id: '__df1__', name: 'Room 101' }]
  const demoPersons = [{ id: '__dp1__', property_id: '__demo__', floor_id: '__df1__', room_id: '__dr1__', name: '' }]

  const handleDemoAction = async (action) => {
    const prop = await createProperty({ userId: user.id, name: 'My Property', type: 'pg', address: '' })
    setProperties([prop])
    await action(prop.id)
  }

  const demoHandleAddFloor = () =>
    handleDemoAction(async pid => {
      const f = await createFloor({ userId: user.id, propertyId: pid, name: 'Floor 1' })
      setFloors([f])
    })

  const demoHandleAddRoom = () =>
    handleDemoAction(async pid => {
      const f = await createFloor({ userId: user.id, propertyId: pid, name: 'Floor 1' })
      setFloors([f])
      const r = await createRoom({ userId: user.id, propertyId: pid, floorId: f.id, name: 'Room 101' })
      setRooms([r])
    })

  const demoHandleAddPerson = () =>
    handleDemoAction(async pid => {
      const f = await createFloor({ userId: user.id, propertyId: pid, name: 'Floor 1' })
      setFloors([f])
      const r = await createRoom({ userId: user.id, propertyId: pid, floorId: f.id, name: 'Room 101' })
      setRooms([r])
      const p = await createPerson({ userId: user.id, propertyId: pid, floorId: f.id, roomId: r.id, name: '', phone: '' })
      setPersons([p])
      setSelectedPerson(p)
    })

  const demoHandleEditName = async (name) => {
    const prop = await createProperty({ userId: user.id, name, type: 'pg', address: '' })
    setProperties([prop])
  }

  const demoHandleDelete = () => { }

  const handleAddFloor = async (propertyId) => {
    const data = await createFloor({ userId: user.id, propertyId, name: 'New Floor' })
    setFloors(prev => [data, ...prev])
    setAutoEditId(data.id)
    const prop = properties.find(p => p.id === propertyId)
    logEvent({ userId: user.id, propertyId, eventType: 'floor_created', description: `Floor "${data.name}" added in "${prop?.name}"` }).catch(() => {})
  }
  const handleUpdateFloor = async (id, name) => {
    const old = floors.find(f => f.id === id)
    await updateFloor(id, { name })
    setFloors(prev => prev.map(f => f.id === id ? { ...f, name } : f))
    const prop = properties.find(p => p.id === old?.property_id)
    logEvent({ userId: user.id, propertyId: old?.property_id, eventType: 'floor_updated', description: `Floor renamed from "${old?.name}" to "${name}" in "${prop?.name}"` }).catch(() => {})
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
    logEvent({ userId: user.id, propertyId: floor?.property_id, eventType: 'floor_deleted', description: `Floor "${floor?.name}" deleted from "${prop?.name}"` }).catch(() => {})
  }

  const handleAddRoom = async (propertyId, floorId) => {
    const data = await createRoom({ userId: user.id, propertyId, floorId, name: 'New Room' })
    setRooms(prev => [...prev, data])
    setAutoEditId(data.id)
    const prop = properties.find(p => p.id === propertyId)
    logEvent({ userId: user.id, propertyId, eventType: 'room_created', description: `Room "${data.name}" added in "${prop?.name}"` }).catch(() => {})
  }
  const handleUpdateRoom = async (id, name) => {
    const old = rooms.find(r => r.id === id)
    await updateRoom(id, { name })
    setRooms(prev => prev.map(r => r.id === id ? { ...r, name } : r))
    const prop = properties.find(p => p.id === old?.property_id)
    logEvent({ userId: user.id, propertyId: old?.property_id, eventType: 'room_updated', description: `Room renamed from "${old?.name}" to "${name}" in "${prop?.name}"` }).catch(() => {})
  }
  const handleDeleteRoom = async (id) => {
    const ok = await confirm('Delete this room?')
    if (!ok) return
    const room = rooms.find(r => r.id === id)
    await deleteRoom(id)
    setRooms(prev => prev.filter(r => r.id !== id))
    setPersons(prev => prev.filter(p => p.room_id !== id))
    const prop = properties.find(p => p.id === room?.property_id)
    logEvent({ userId: user.id, propertyId: room?.property_id, eventType: 'room_deleted', description: `Room "${room?.name}" deleted from "${prop?.name}"` }).catch(() => {})
  }

  const handleAddPerson = async (propertyId, floorId, roomId) => {
    const data = await createPerson({ userId: user.id, propertyId, floorId, roomId, name: '', phone: '' })
    setPersons(prev => [...prev, data])
    const prop = properties.find(p => p.id === propertyId)
    logEvent({ userId: user.id, propertyId, personId: data.id, eventType: 'person_added', description: `Bed added in "${prop?.name}"` }).catch(() => {})
  }
  if (loading) return <Loader />

  return (
    <div className="apt-builder">

      <div className="apt-list">
        {!readOnly && properties.length === 0 && (
          <div className="apt-building apt-building--demo">
            <div className="apt-roof-body">
              <Building2 size={20} className="apt-roof-icon" />
              <InlineEdit value={demoProp.name} onSave={demoHandleEditName} />
              <span className="apt-roof-badge">{demoProp.type}</span>
              <span className="apt-roof-meta">1 floor</span>
              <span className="apt-demo-badge">Quick Start</span>
              <button className="apt-icon-btn apt-icon-btn--del" onClick={demoHandleDelete} title="Dismiss">
                <Trash2 size={15} />
              </button>
            </div>
            <div className="apt-body">
              <button className="apt-add-floor" onClick={demoHandleAddFloor} title="Add floor">
                <Plus size={18} /> Add Floor
              </button>
              {demoFloors.map(floor => (
                <div key={floor.id} className="apt-floor apt-floor--demo">
                  <div className="apt-floor-label">
                    <span className="apt-floor-dot" />
                    <span className="vi-label">{floor.name}</span>
                    <span className="apt-floor-count">1 room</span>
                  </div>
                  <div className="apt-units">
                    {demoRooms.filter(r => r.floor_id === floor.id).map(room => (
                      <div key={room.id} className="apt-room apt-room--demo">
                        <div className="apt-room-head">
                          <DoorOpen size={16} className="apt-room-icon" />
                          <span className="vi-label">{room.name}</span>
                        </div>
                        <div className="apt-beds">
                          {demoPersons.filter(p => p.room_id === room.id).map(person => (
                            <div key={person.id} className="apt-bed apt-bed--empty" onClick={demoHandleAddPerson} title="Add occupant">
            {!person.name || !person.is_active ? <Bed size={14} className="apt-bed-icon" /> : <User size={14} className="apt-bed-icon" />}
                              <span className="vi-label">Empty</span>
                            </div>
                          ))}
                          <button className="apt-add-bed" onClick={demoHandleAddPerson} title="Add person">
                            <Plus size={13} /> Bed
                          </button>
                        </div>
                      </div>
                    ))}
                    <button className="apt-add-unit" onClick={demoHandleAddRoom} title="Add room">
                      <Plus size={16} /> Room
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {properties.map(property => {
          const propertyFloors = floors.filter(f => f.property_id === property.id)

          return (
            <div key={property.id} className="apt-building">
              <div className="apt-roof">
                <div className="apt-roof-body">
                  <Building2 size={20} className="apt-roof-icon" />
                  <InlineEdit value={property.name} onSave={name => handleUpdateProperty(property.id, name)} readOnly={readOnly} autoEdit={property.id === autoEditId} onAutoEditEnd={clearAutoEditId} />
                  <span className="apt-roof-badge">{property.type}</span>
                  <span className="apt-roof-meta">{propertyFloors.length} floor{propertyFloors.length !== 1 ? 's' : ''}</span>
                  <button
                    className="apt-icon-btn apt-collapse-btn"
                    onClick={() => toggleCollapse(property.id)}
                    title={collapsed.has(property.id) ? 'Expand' : 'Collapse'}
                  >
                    <ChevronDown size={16} className={`apt-chevron ${collapsed.has(property.id) ? 'apt-chevron--collapsed' : ''}`} />
                  </button>
                  {!readOnly && (
                    <button className="apt-icon-btn apt-icon-btn--del" onClick={() => handleDeleteProperty(property.id)} title="Delete building">
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>

              {!collapsed.has(property.id) && (
                <div className="apt-body">
                  {!readOnly && (
                    <button className="apt-add-floor" onClick={() => handleAddFloor(property.id)} title="Add floor">
                      <Plus size={18} /> Add Floor
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
        <button className="apt-add-building" onClick={handleAddProperty}>
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
