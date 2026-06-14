import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthProvider'
import { Receipt, Building2 } from 'lucide-react'
import VisualPropertyBuilder from '../../components/ui/VisualPropertyBuilder'
import RentTypesManager from '../../components/ui/RentTypesManager'
import { fetchRentTypes, seedDefaultRentTypes } from '../../lib/rentals'

const tabs = [
  { key: 'builder', label: 'Property', icon: Building2 },
  { key: 'rent', label: 'Rent Types', icon: Receipt },
]

export default function CreatePage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('builder')

  useEffect(() => {
    if (!user) return
    fetchRentTypes(user.id).then(data => {
      if (data.length === 0) seedDefaultRentTypes(user.id)
    })
  }, [user])

  return (
    <div className="page-create">
      {/* <div className="page-header">
        <h1>Create</h1>
        <p className="page-subtitle">Build your property and add occupants with rent</p>
      </div> */}

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
        {activeTab === 'builder' && <VisualPropertyBuilder />}
        {activeTab === 'rent' && (
          <div className="rent-types-panel">
            <RentTypesManager userId={user.id} />
          </div>
        )}
      </div>
    </div>
  )
}
