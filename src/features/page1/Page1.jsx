import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import { getPushedPage } from '../../lib/pageStore'

export default function Page1() {
  const navigate = useNavigate()
  const [page, setPage] = useState(null)

  useEffect(() => {
    setPage(getPushedPage())
  }, [])

  if (!page) {
    return (
      <div className="page-placeholder">
        <h1>Page 1</h1>
        <p className="page-subtitle">No page pushed yet. Go to <strong>Make</strong>, generate some code, then push it here.</p>
        <button className="btn-push" style={{ marginTop: 16 }} onClick={() => navigate('/make')}>
          Go to Make
        </button>
      </div>
    )
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 24px', flexShrink: 0 }}>
        <button onClick={() => navigate('/make')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text, #0f172a)', display: 'flex' }}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{page.name || 'Pushed Page'}</h1>
          <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0' }}>Pushed from Make</p>
        </div>
        <button
          onClick={() => setPage(getPushedPage())}
          style={{ marginLeft: 'auto', background: 'none', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', fontFamily: 'inherit' }}
        >
          <RefreshCw size={14} /> Reload
        </button>
      </div>
      <iframe
        srcDoc={page.code}
        title="pushed-page"
        style={{ flex: 1, width: '100%', border: 'none', borderRadius: 0 }}
        sandbox="allow-scripts"
      />
    </div>
  )
}
