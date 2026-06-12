import { Outlet, Navigate } from 'react-router-dom'
import FloatingNav from '../ui/FloatingNav'
import Loader from '../ui/Loader'
import { useAuth } from '../../context/AuthProvider'
import { isSupabaseConfigured } from '../../lib/supabaseClient'

export default function AppLayout() {
  const { user, loading, isRecoveryMode } = useAuth()

  if (!isSupabaseConfigured) {
    return (
      <main className="app-shell">
        <section className="auth-card">
          <h1>RentJaga</h1>
          <p>Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to a <code>.env</code> file.</p>
        </section>
      </main>
    )
  }

  if (loading) {
    return (
      <div className="app-shell">
        <Loader />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  if (isRecoveryMode) return <Navigate to="/forgot-password" replace />

  return (
    <div className="app-layout">
      <FloatingNav />
      <main className="app-content">
        <Outlet />
      </main>
    </div>
  )
}
