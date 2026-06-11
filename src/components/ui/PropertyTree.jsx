import { useState } from 'react'
import {
  Building2, ChevronRight, ChevronDown, Plus, Trash2,
} from 'lucide-react'
import { useConfirm } from '../../context/ConfirmContext'

export default function PropertyTree({ property, floors, rooms, persons, onAddFloor, onAddRoom, onAddPerson, onDeleteFloor, onDeleteRoom, onDeletePerson, onDeleteProperty }) {
  const confirm = useConfirm()
  const [expanded, setExpanded] = useState(true)

  const floorsList = floors.filter(f => f.property_id === property.id)
  const toggle = () => setExpanded(e => !e)

  return (
    <div className="property-tree">
      <div className="tree-node tree-node-property" onClick={toggle}>
        <span className="tree-toggle">
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </span>
        <Building2 size={18} className="tree-icon" />
        <span className="tree-label">{property.name}</span>
        <span className="tree-badge">{property.type}</span>
        <span className="tree-count">{floorsList.length} floor{floorsList.length !== 1 ? 's' : ''}</span>
        <div className="tree-node-actions">
          <button className="tree-add-btn" onClick={e => { e.stopPropagation(); onAddFloor(property.id) }} title="Add floor">
            <Plus size={14} />
          </button>
          {onDeleteProperty && (
            <button className="tree-del-btn" onClick={async e => { e.stopPropagation(); const ok = await confirm('Delete this property and everything under it?'); if (ok) onDeleteProperty(property.id) }} title="Delete property">
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {expanded && (
        <div className="tree-children">
          {floorsList.length === 0 && (
            <div className="tree-empty">No floors yet. Click + to add one.</div>
          )}
          {floorsList.map(floor => (
            <FloorNode
              key={floor.id}
              floor={floor}
              rooms={rooms}
              persons={persons}
              onAddRoom={onAddRoom}
              onAddPerson={onAddPerson}
              onDeleteFloor={onDeleteFloor}
              onDeleteRoom={onDeleteRoom}
              onDeletePerson={onDeletePerson}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function FloorNode({ floor, rooms, persons, onAddRoom, onAddPerson, onDeleteFloor, onDeleteRoom, onDeletePerson }) {
  const [expanded, setExpanded] = useState(true)
  const roomsList = rooms.filter(r => r.floor_id === floor.id)
  const toggle = () => setExpanded(e => !e)

  return (
    <div className="tree-node-wrapper">
      <div className="tree-node tree-node-floor" onClick={toggle}>
        <span className="tree-toggle">
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>
        <span className="tree-icon tree-icon-floor" />
        <span className="tree-label">{floor.name || `Floor ${floor.id.slice(0, 4)}`}</span>
        <span className="tree-count">{roomsList.length} room{roomsList.length !== 1 ? 's' : ''}</span>
        <div className="tree-node-actions">
          <button className="tree-add-btn" onClick={e => { e.stopPropagation(); onAddRoom(floor.property_id, floor.id) }} title="Add room">
            <Plus size={14} />
          </button>
          <button className="tree-del-btn" onClick={async e => { e.stopPropagation(); const ok = await confirm('Delete this floor and its rooms?'); if (ok) onDeleteFloor(floor.id) }} title="Delete floor">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="tree-children">
          {roomsList.length === 0 && (
            <div className="tree-empty">No rooms yet. Click + to add one.</div>
          )}
          {roomsList.map(room => (
            <RoomNode
              key={room.id}
              room={room}
              persons={persons}
              onAddPerson={onAddPerson}
              onDeleteRoom={onDeleteRoom}
              onDeletePerson={onDeletePerson}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function RoomNode({ room, persons, onAddPerson, onDeleteRoom, onDeletePerson }) {
  const [expanded, setExpanded] = useState(true)
  const personsList = persons.filter(p => p.room_id === room.id)
  const toggle = () => setExpanded(e => !e)

  return (
    <div className="tree-node-wrapper">
      <div className="tree-node tree-node-room" onClick={toggle}>
        <span className="tree-toggle">
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>
        <span className="tree-icon tree-icon-room" />
        <span className="tree-label">{room.name || `Room`}</span>
        <span className="tree-count">{personsList.length} person{personsList.length !== 1 ? 's' : ''}</span>
        <div className="tree-node-actions">
          <button className="tree-add-btn" onClick={e => { e.stopPropagation(); onAddPerson(room.property_id, room.floor_id, room.id) }} title="Add person">
            <Plus size={14} />
          </button>
          <button className="tree-del-btn" onClick={async e => { e.stopPropagation(); const ok = await confirm('Delete this room?'); if (ok) onDeleteRoom(room.id) }} title="Delete room">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="tree-children">
          {personsList.length === 0 && (
            <div className="tree-empty">No persons in this room.</div>
          )}
          {personsList.map(person => (
            <PersonNode key={person.id} person={person} onDelete={onDeletePerson} />
          ))}
        </div>
      )}
    </div>
  )
}

function PersonNode({ person, onDelete }) {
  return (
    <div className="tree-node-wrapper">
      <div className="tree-node tree-node-person">
        <span className="tree-icon tree-icon-person" />
        <span className="tree-label">{person.name}</span>
        {person.phone && <span className="tree-meta">{person.phone}</span>}
        {person.room_no && <span className="tree-meta">Room {person.room_no}</span>}
        <div className="tree-node-actions">
          <button className="tree-del-btn" onClick={async () => { const ok = await confirm('Remove this person?'); if (ok) onDelete(person.id) }} title="Remove person">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
