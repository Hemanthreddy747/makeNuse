import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { getPageSlots, deletePageSlot } from '../../lib/pageStore'

export default function PageSlotViewer() {
  const { name } = useParams()
  const navigate = useNavigate()
  const [page, setPage] = useState(null)
  const decoded = decodeURIComponent(name)

  useEffect(() => {
    const slots = getPageSlots()
    setPage(slots[decoded] || null)
  }, [decoded])

  const handleDelete = () => {
    deletePageSlot(decoded)
    navigate('/make')
  }

  if (!page) {
    return (
      <div className="page-placeholder">
        <h1>Page Not Found</h1>
        <p className="page-subtitle">No page named "{decoded}" exists.</p>
        <button className="btn-push" style={{ marginTop: 16 }} onClick={() => navigate('/make')}>
          Go to Make
        </button>
      </div>
    )
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 24px', flexShrink: 0 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text, #0f172a)', display: 'flex' }}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{page.name || decoded}</h1>
          <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0' }}>Custom page</p>
        </div>
        <button
          onClick={handleDelete}
          style={{ marginLeft: 'auto', background: 'none', border: '1px solid #e5e7eb', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', fontFamily: 'inherit', color: '#ef4444' }}
        >
          <Trash2 size={14} /> Delete
        </button>
      </div>
      <iframe
        srcDoc={page.code}
        title={decoded}
        style={{ flex: 1, width: '100%', border: 'none', borderRadius: 0 }}
        sandbox="allow-scripts"
      />
    </div>
  )
}
