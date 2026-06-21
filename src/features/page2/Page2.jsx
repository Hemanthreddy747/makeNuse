import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2, ExternalLink, Plus } from 'lucide-react'
import { getSavedPages, deletePage, setPushedPage } from '../../lib/pageStore'

export default function Page2() {
  const navigate = useNavigate()
  const [pages, setPages] = useState([])

  const load = () => setPages(getSavedPages())

  useEffect(() => {
    load()
  }, [])

  const handleDelete = (id) => {
    deletePage(id)
    load()
  }

  const handleUse = (page) => {
    setPushedPage(page)
    navigate('/page1')
  }

  return (
    <div className="page-placeholder">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0 }}>Page 2</h1>
          <p className="page-subtitle" style={{ margin: '4px 0 0' }}>Your custom coded pages</p>
        </div>
        <button className="btn-push" onClick={() => navigate('/make')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 18px', fontSize: '0.85rem', fontWeight: 600, border: 'none', borderRadius: 10, background: 'linear-gradient(135deg, #7c3aed, #f97316)', color: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}>
          <Plus size={16} /> Create New
        </button>
      </div>

      {pages.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: '#64748b' }}>
          <p style={{ fontSize: '1.1rem', marginBottom: 8 }}>No saved pages yet</p>
          <p style={{ fontSize: '0.9rem' }}>Generate a page in <strong>Make</strong> and save it here.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {[...pages].reverse().map((page) => (
            <div
              key={page.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderRadius: 12,
                border: '1px solid var(--color-border, #e5e7eb)',
                background: 'var(--color-surface, #fff)',
              }}
            >
              <div>
                <strong style={{ fontSize: '1rem' }}>{page.name || 'Untitled'}</strong>
                <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                  {new Date(page.createdAt).toLocaleString()}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn-push" onClick={() => handleUse(page)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', fontSize: '0.8rem', fontWeight: 600, border: 'none', borderRadius: 8, background: 'linear-gradient(135deg, #7c3aed, #f97316)', color: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}>
                  <ExternalLink size={14} /> View
                </button>
                <button onClick={() => handleDelete(page.id)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', fontSize: '0.8rem', fontWeight: 600, border: '1px solid #e5e7eb', borderRadius: 8, background: 'transparent', color: '#ef4444', cursor: 'pointer', fontFamily: 'inherit' }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
