import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { AuthProvider, useAuth } from './context/AuthProvider'
import { LoginModalProvider, useLoginModal } from './context/LoginModalContext'
import { ConfirmProvider } from './context/ConfirmContext'
import { ThemeProvider } from './context/ThemeContext'
import AppLayout from './components/layout/AppLayout'
import Landing from './landing/Landing'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import LoginModal from './components/ui/LoginModal'
import DashboardPage from './features/dashboard/DashboardPage'
import ProfilePage from './features/profile/ProfilePage'
import CreatePage from './features/add-new/AddNewPage'
import ManagePage from './features/manage/ManagePage'
import Loader from './components/ui/Loader'
import { useEffect } from 'react'
import { isSupabaseConfigured } from './lib/supabaseClient'
import './App.css'

function AuthRedirect({ view }) {
  const { openLogin, openSignup, openForgotPassword } = useLoginModal()
  const navigate = useNavigate()

  useEffect(() => {
    if (view === 'signup') openSignup()
    else if (view === 'forgot') openForgotPassword()
    else openLogin()
    navigate('/', { replace: true })
  }, [view, openLogin, openSignup, openForgotPassword, navigate])

  return null
}

function ForgotPasswordRoute() {
  const { user, loading, isRecoveryMode } = useAuth()
  const { openForgotPassword } = useLoginModal()
  const navigate = useNavigate()

  useEffect(() => {
    if (loading) return
    if (user && isRecoveryMode) return
    openForgotPassword()
    navigate('/', { replace: true })
  }, [loading, user, isRecoveryMode, openForgotPassword, navigate])

  if (loading) return <div className="app-shell"><Loader /></div>
  if (user && isRecoveryMode) return <ForgotPasswordPage />
  return null
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<AuthRedirect view="login" />} />
      <Route path="/signup" element={<AuthRedirect view="signup" />} />
      <Route path="/forgot-password" element={<ForgotPasswordRoute />} />

      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/create" element={<CreatePage />} />
        <Route path="/manage" element={<ManagePage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      <Route path="/" element={<Landing />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function AppContent() {
  return (
    <LoginModalProvider>
      <ConfirmProvider>
        <ThemeProvider>
          <AppRoutes />
        </ThemeProvider>
      </ConfirmProvider>
      <LoginModal />
      <ToastContainer position="bottom-left" autoClose={3000} />
    </LoginModalProvider>
  )
}

function App() {
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

  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
