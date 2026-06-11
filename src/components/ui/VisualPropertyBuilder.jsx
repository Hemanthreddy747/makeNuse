import { useState, useEffect, useRef } from 'react'
import { Plus, Trash2, Building2, Bed, DoorOpen, ChevronDown } from 'lucide-react'
import { useAuth } from '../../context/AuthProvider'
import { useConfirm } from '../../context/ConfirmContext'
import InputModal from './InputModal'
import {
  fetchProperties, createProperty, deleteProperty, updateProperty,
  fetchAllFloors, createFloor, deleteFloor, updateFloor,
  fetchAllRooms, createRoom, deleteRoom, updateRoom,
  fetchPersons, createPerson, deletePerson, updatePerson,
} from '../../lib/rentals'

function InlineEdit({ value, onSave }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(value)
  const inputRef = useRef(null)

  useEffect(() => { setVal(value) }, [value])

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.select()
  }, [editing])

  const submit = () => {
    const trimmed = val.trim()
    if (trimmed && trimmed !== value) {
      onSave(trimmed)
    } else {
      setVal(value)
    }
    setEditing(false)
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        className="vi-input"
        value={val}
        onChange={e => setVal(e.target.value)}
        onBlur={submit}
        onKeyDown={e => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') { setVal(value); setEditing(false) } }}
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

function RoomCard({ room, persons, onAddPerson, onUpdateRoom, onDeleteRoom, onUpdatePerson, onDeletePerson }) {
  const roomPersons = persons.filter(p => p.room_id === room.id)

  return (
    <div className="apt-room">
      <div className="apt-room-head">
        <DoorOpen size={16} className="apt-room-icon" />
        <InlineEdit value={room.name} onSave={name => onUpdateRoom(room.id, name)} />
        <button className="apt-icon-btn apt-icon-btn--del" onClick={() => onDeleteRoom(room.id)} title="Delete room">
          <Trash2 size={13} />
        </button>
      </div>
      <div className="apt-beds">
        {roomPersons.map(person => (
          <div key={person.id} className={`apt-bed${!person.name ? ' apt-bed--empty' : ''}`}>
            <Bed size={15} className="apt-bed-icon" />
            <InlineEdit value={person.name || 'Empty'} onSave={name => onUpdatePerson(person.id, name)} />
            <button className="apt-bed-del" onClick={() => onDeletePerson(person.id)} title="Remove person">
              <Trash2 size={11} />
            </button>
          </div>
        ))}
        <button className="apt-add-bed" onClick={() => onAddPerson(room.property_id, room.floor_id, room.id)} title="Add person">
          <Plus size={13} /> Bed
        </button>
      </div>
    </div>
  )
}

function FloorSection({ floor, rooms, persons, onAddRoom, onUpdateFloor, onDeleteFloor, onAddPerson, onUpdateRoom, onDeleteRoom, onUpdatePerson, onDeletePerson }) {
  const floorRooms = rooms.filter(r => r.floor_id === floor.id)

  return (
    <div className="apt-floor">
      <div className="apt-floor-label">
        <span className="apt-floor-dot" />
        <InlineEdit value={floor.name} onSave={name => onUpdateFloor(floor.id, name)} />
        <span className="apt-floor-count">{floorRooms.length} room{floorRooms.length !== 1 ? 's' : ''}</span>
        <button className="apt-icon-btn apt-icon-btn--del" onClick={() => onDeleteFloor(floor.id)} title="Delete floor">
          <Trash2 size={14} />
        </button>
      </div>
      <div className="apt-units">
        {floorRooms.map(room => (
          <RoomCard
            key={room.id}
            room={room}
            persons={persons}
            onAddPerson={onAddPerson}
            onUpdateRoom={onUpdateRoom}
            onDeleteRoom={onDeleteRoom}
            onUpdatePerson={onUpdatePerson}
            onDeletePerson={onDeletePerson}
          />
        ))}
        <button className="apt-add-unit" onClick={() => onAddRoom(floor.property_id, floor.id)} title="Add room">
          <Plus size={16} /> Room
        </button>
      </div>
    </div>
  )
}

export default function VisualPropertyBuilder() {
  const { user } = useAuth()
  const confirm = useConfirm()
  const [properties, setProperties] = useState([])
  const [floors, setFloors] = useState([])
  const [rooms, setRooms] = useState([])
  const [persons, setPersons] = useState([])
  const [loading, setLoading] = useState(true)
  const [inputModal, setInputModal] = useState({ open: false, title: '', placeholder: '', onCreate: null })
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

  const openInputModal = (title, placeholder, onCreate) => {
    setInputModal({ open: true, title, placeholder, onCreate })
  }
  const closeInputModal = () => {
    setInputModal({ open: false, title: '', placeholder: '', onCreate: null })
  }

  const load = () => {
    Promise.all([
      fetchProperties(user.id),
      fetchAllFloors(user.id),
      fetchAllRooms(user.id),
      fetchPersons(user.id),
    ]).then(([p, f, r, pe]) => {
      setProperties(p)
      setFloors(f)
      setRooms(r)
      setPersons(pe)
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  useEffect(load, [user.id])

  const handleAddProperty = () => {
    openInputModal('Add Property', 'e.g. My Homestay', async (name) => {
      const data = await createProperty({ userId: user.id, name: name || 'New Property', type: 'pg', address: '' })
      setProperties(prev => [...prev, data])
    })
  }
  const handleUpdateProperty = async (id, name) => {
    await updateProperty(id, { name })
    setProperties(prev => prev.map(p => p.id === id ? { ...p, name } : p))
  }
  const handleDeleteProperty = async (id) => {
    const ok = await confirm('Delete this property and everything under it?')
    if (!ok) return
    await deleteProperty(id)
    setProperties(prev => prev.filter(p => p.id !== id))
    setFloors(prev => prev.filter(f => f.property_id !== id))
    setRooms(prev => prev.filter(r => r.property_id !== id))
    setPersons(prev => prev.filter(p => p.property_id !== id))
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
    })

  const demoHandleEditName = async (name) => {
    const prop = await createProperty({ userId: user.id, name, type: 'pg', address: '' })
    setProperties([prop])
  }

  const demoHandleDelete = () => { }

  const handleAddFloor = (propertyId) => {
    openInputModal('Add Floor', 'e.g. Ground Floor, 1st Floor', async (name) => {
      const data = await createFloor({ userId: user.id, propertyId, name: name || 'New Floor' })
      setFloors(prev => [...prev, data])
    })
  }
  const handleUpdateFloor = async (id, name) => {
    await updateFloor(id, { name })
    setFloors(prev => prev.map(f => f.id === id ? { ...f, name } : f))
  }
  const handleDeleteFloor = async (id) => {
    const ok = await confirm('Delete this floor and its rooms?')
    if (!ok) return
    await deleteFloor(id)
    setFloors(prev => prev.filter(f => f.id !== id))
    setRooms(prev => prev.filter(r => r.floor_id !== id))
    setPersons(prev => prev.filter(p => p.floor_id !== id))
  }

  const handleAddRoom = (propertyId, floorId) => {
    openInputModal('Add Room', 'e.g. Room 101', async (name) => {
      const data = await createRoom({ userId: user.id, propertyId, floorId, name: name || 'New Room' })
      setRooms(prev => [...prev, data])
    })
  }
  const handleUpdateRoom = async (id, name) => {
    await updateRoom(id, { name })
    setRooms(prev => prev.map(r => r.id === id ? { ...r, name } : r))
  }
  const handleDeleteRoom = async (id) => {
    const ok = await confirm('Delete this room?')
    if (!ok) return
    await deleteRoom(id)
    setRooms(prev => prev.filter(r => r.id !== id))
    setPersons(prev => prev.filter(p => p.room_id !== id))
  }

  const handleAddPerson = (propertyId, floorId, roomId) => {
    openInputModal('Add Person', 'e.g. John', async (name) => {
      const data = await createPerson({ userId: user.id, propertyId, floorId, roomId, name: name || '', phone: '' })
      setPersons(prev => [...prev, data])
    })
  }
  const handleUpdatePerson = async (id, name) => {
    await updatePerson(id, { name })
    setPersons(prev => prev.map(p => p.id === id ? { ...p, name } : p))
  }
  const handleDeletePerson = async (id) => {
    const ok = await confirm('Remove this person?')
    if (!ok) return
    await deletePerson(id)
    setPersons(prev => prev.filter(p => p.id !== id))
  }

  if (loading) return <p className="text-muted">Loading...</p>

  return (
    <div className="apt-builder">

      <div className="apt-list">
        {properties.length === 0 && (
          <div className="apt-building apt-building--demo">
            <div className="apt-roof-edge" />
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
                            <div key={person.id} className="apt-bed apt-bed--empty">
                              <Bed size={15} className="apt-bed-icon" />
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
              <button className="apt-add-floor" onClick={demoHandleAddFloor} title="Add floor">
                <Plus size={18} /> Add Floor
              </button>
            </div>
          </div>
        )}

        {properties.map(property => {
          const propertyFloors = floors.filter(f => f.property_id === property.id)

          return (
            <div key={property.id} className="apt-building">
              <div className="apt-roof">
                <div className="apt-roof-edge" />
                <div className="apt-roof-body">
                  <Building2 size={20} className="apt-roof-icon" />
                  <InlineEdit value={property.name} onSave={name => handleUpdateProperty(property.id, name)} />
                  <span className="apt-roof-badge">{property.type}</span>
                  <span className="apt-roof-meta">{propertyFloors.length} floor{propertyFloors.length !== 1 ? 's' : ''}</span>
                  <button
                    className="apt-icon-btn apt-collapse-btn"
                    onClick={() => toggleCollapse(property.id)}
                    title={collapsed.has(property.id) ? 'Expand' : 'Collapse'}
                  >
                    <ChevronDown size={16} className={`apt-chevron ${collapsed.has(property.id) ? 'apt-chevron--collapsed' : ''}`} />
                  </button>
                  <button className="apt-icon-btn apt-icon-btn--del" onClick={() => handleDeleteProperty(property.id)} title="Delete building">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {!collapsed.has(property.id) && (
                <div className="apt-body">
                  {propertyFloors.map(floor => (
                    <FloorSection
                      key={floor.id}
                      floor={floor}
                      rooms={rooms}
                      persons={persons}
                      onAddRoom={handleAddRoom}
                      onUpdateFloor={handleUpdateFloor}
                      onDeleteFloor={handleDeleteFloor}
                      onAddPerson={handleAddPerson}
                      onUpdateRoom={handleUpdateRoom}
                      onDeleteRoom={handleDeleteRoom}
                      onUpdatePerson={handleUpdatePerson}
                      onDeletePerson={handleDeletePerson}
                    />
                  ))}
                  <button className="apt-add-floor" onClick={() => handleAddFloor(property.id)} title="Add floor">
                    <Plus size={18} /> Add Floor
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <button className="apt-add-building" onClick={handleAddProperty}>
        <Plus size={20} /> Add Property
      </button>

      <InputModal
        open={inputModal.open}
        title={inputModal.title}
        placeholder={inputModal.placeholder}
        onConfirm={async (name) => {
          await inputModal.onCreate(name)
          closeInputModal()
        }}
        onCancel={closeInputModal}
      />
    </div>
  )
}
