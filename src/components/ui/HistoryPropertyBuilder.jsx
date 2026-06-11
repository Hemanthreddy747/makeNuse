import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthProvider'
import {
  fetchProperties,
  fetchAllFloors,
  fetchAllRooms,
  fetchFormerPersons,
} from '../../lib/rentals'
import { Building2, Bed, DoorOpen, Calendar } from 'lucide-react'

function formatDate(d) {
  if (!d) return ''
  const date = new Date(d)
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function HistoryPropertyBuilder() {
  const { user } = useAuth()
  const [properties, setProperties] = useState([])
  const [floors, setFloors] = useState([])
  const [rooms, setRooms] = useState([])
  const [persons, setPersons] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) return
    setLoading(true)
    Promise.all([
      fetchProperties(user.id),
      fetchAllFloors(user.id),
      fetchAllRooms(user.id),
      fetchFormerPersons(user.id),
    ]).then(([p, f, r, pe]) => {
      setProperties(p)
      setFloors(f)
      setRooms(r)
      setPersons(pe)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [user?.id])

  if (loading) return <p className="text-muted">Loading...</p>

  if (properties.length === 0 || persons.length === 0) {
    return (
      <div className="apt-empty">
        <Calendar size={32} className="apt-empty-icon" />
        <p>No former tenants yet.</p>
        <p className="text-muted">When someone is removed from a property, they'll appear here with their stay dates.</p>
      </div>
    )
  }

  return (
    <div className="apt-builder">
      <div className="apt-list">
        {properties.map(property => {
          const propertyFloors = floors.filter(f => f.property_id === property.id)
          const hasFormerTenants = persons.some(p => p.property_id === property.id)

          if (!hasFormerTenants) return null

          return (
            <div key={property.id} className="apt-building">
              <div className="apt-roof">
                <div className="apt-roof-edge" />
                <div className="apt-roof-body">
                  <Building2 size={20} className="apt-roof-icon" />
                  <span className="vi-label">{property.name}</span>
                  <span className="apt-roof-badge">{property.type}</span>
                  <span className="apt-roof-meta">
                    {persons.filter(p => p.property_id === property.id).length} former
                  </span>
                </div>
              </div>
              <div className="apt-body">
                {propertyFloors.map(floor => {
                  const floorRooms = rooms.filter(r => r.floor_id === floor.id)
                  const hasFloorFormer = persons.some(p => p.property_id === property.id && p.floor_id === floor.id)

                  if (!hasFloorFormer) return null

                  return (
                    <div key={floor.id} className="apt-floor">
                      <div className="apt-floor-label">
                        <span className="apt-floor-dot" />
                        <span className="vi-label">{floor.name}</span>
                      </div>
                      <div className="apt-units">
                        {floorRooms.map(room => {
                          const roomPersons = persons.filter(
                            p => p.property_id === property.id && p.floor_id === floor.id && p.room_id === room.id
                          )

                          if (roomPersons.length === 0) return null

                          return (
                            <div key={room.id} className="apt-room">
                              <div className="apt-room-head">
                                <DoorOpen size={16} className="apt-room-icon" />
                                <span className="vi-label">{room.name}</span>
                              </div>
                              <div className="apt-beds">
                                {roomPersons.map(person => (
                                  <div key={person.id} className="apt-bed apt-bed--former">
                                    <Bed size={15} className="apt-bed-icon" />
                                    <span className="vi-label">{person.name}</span>
                                    <span className="apt-bed-dates">
                                      {formatDate(person.move_in_date)} &rarr; {formatDate(person.move_out_date)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
