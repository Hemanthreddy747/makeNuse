import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthProvider'
import { useLoginModal } from '../../context/LoginModalContext'
import { toast } from 'react-toastify'
import { X } from 'lucide-react'

function EyeIcon({ open }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {open ? (
        <>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </>
      ) : (
        <>
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </>
      )}
    </svg>
  )
}

function getStrength(password) {
  if (!password) return { score: 0, label: '', color: '', width: '0%' }
  let score = 0
  if (password.length >= 6) score += 1
  if (password.length >= 10) score += 1
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1
  if (/\d/.test(password)) score += 1
  if (/[^a-zA-Z0-9]/.test(password)) score += 1
  if (score <= 1) return { score: 1, label: 'Weak', color: '#dc2626', width: '25%' }
  if (score === 2) return { score: 2, label: 'Fair', color: '#f59e0b', width: '50%' }
  if (score === 3) return { score: 3, label: 'Good', color: '#10b981', width: '75%' }
  return { score: 4, label: 'Strong', color: '#059669', width: '100%' }
}

export default function LoginModal() {
  const navigate = useNavigate()
  const { isOpen, view, closeLogin, switchView } = useLoginModal()
  const { signIn, signUp, sendOtp, verifyOtp, signInWithGoogle, resetPassword } = useAuth()

  const [isLoading, setIsLoading] = useState(false)

  const [authTab, setAuthTab] = useState('email')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})

  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)

  const [confirmPassword, setConfirmPassword] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)

  const [forgotSent, setForgotSent] = useState(false)
  const [forgotFieldError, setForgotFieldError] = useState('')

  const strength = getStrength(password)

  useEffect(() => {
    if (!isOpen) {
      setEmail('')
      setPassword('')
      setConfirmPassword('')
      setPhone('')
      setOtp('')
      setOtpSent(false)
      setFieldErrors({})
      setAuthTab('email')
      setForgotSent(false)
      setForgotFieldError('')
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e) => {
      if (e.key === 'Escape') closeLogin()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, closeLogin])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const isValidEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)

  const clearError = (field) => setFieldErrors((p) => { const n = { ...p }; delete n[field]; return n })

  const handleEmailLogin = async (e) => {
    e.preventDefault()
    const errors = {}
    if (!email.trim()) errors.email = 'Email is required'
    else if (!isValidEmail(email)) errors.email = 'Enter a valid email address'
    if (!password) errors.password = 'Password is required'
    setFieldErrors(errors)
    if (Object.keys(errors).length) return

    setIsLoading(true)
    const { error } = await signIn(email, password)
    setIsLoading(false)

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        toast.error('Invalid email or password')
      } else if (error.message.includes('Email not confirmed')) {
        toast.error('Please confirm your email before logging in')
      } else if (error.message.includes('rate limit')) {
        toast.error('Too many attempts. Please try again later')
      } else {
        toast.error(error.message)
      }
    } else {
      toast.success('Logged in successfully')
      closeLogin()
      navigate('/dashboard', { replace: true })
    }
  }

  const handleSignUp = async (e) => {
    e.preventDefault()
    const errors = {}
    if (!email.trim()) errors.email = 'Email is required'
    else if (!isValidEmail(email)) errors.email = 'Enter a valid email address'
    if (!password) errors.password = 'Password is required'
    else if (password.length < 6) errors.password = 'Password must be at least 6 characters'
    if (!confirmPassword) errors.confirmPassword = 'Please confirm your password'
    else if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match'
    setFieldErrors(errors)
    if (Object.keys(errors).length) return

    setIsLoading(true)
    const { error } = await signUp(email, password)
    setIsLoading(false)

    if (error) {
      if (error.message.includes('already registered')) {
        toast.error('An account with this email already exists')
      } else if (error.message.includes('rate limit')) {
        toast.error('Too many attempts. Please try again later')
      } else {
        toast.error(error.message)
      }
    } else {
      toast.success('Account created! Check your email for confirmation.')
      closeLogin()
    }
  }

  const handleSendOtp = async (e) => {
    e.preventDefault()
    const phoneRegex = /^\+[1-9]\d{6,14}$/
    const errors = {}
    if (!phone.trim()) errors.phone = 'Phone number is required'
    else if (!phoneRegex.test(phone)) errors.phone = 'Include country code (e.g. +1234567890)'
    setFieldErrors(errors)
    if (Object.keys(errors).length) return

    setIsLoading(true)
    const { error } = await sendOtp(phone)
    setIsLoading(false)

    if (error) {
      if (error.message.includes('rate limit')) {
        toast.error('Too many requests. Please wait before trying again')
      } else {
        toast.error(error.message)
      }
    } else {
      if (view === 'signup') {
        toast.success('OTP sent to your phone. Complete setup after verification.')
      } else {
        toast.success('OTP sent to your phone')
      }
      setOtpSent(true)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    const errors = {}
    if (!otp.trim()) errors.otp = 'OTP is required'
    else if (!/^\d{6}$/.test(otp)) errors.otp = 'OTP must be 6 digits'
    setFieldErrors(errors)
    if (Object.keys(errors).length) return

    setIsLoading(true)
    const { error } = await verifyOtp(phone, otp)
    setIsLoading(false)

    if (error) {
      if (error.message.toLowerCase().includes('expired')) {
        toast.error('OTP has expired. Request a new one')
        setOtpSent(false)
        setOtp('')
      } else if (error.message.toLowerCase().includes('invalid')) {
        toast.error('Invalid OTP. Please try again')
      } else {
        toast.error(error.message)
      }
    } else {
      const msg = view === 'signup' ? 'Account created and logged in' : 'Logged in successfully'
      toast.success(msg)
      closeLogin()
      navigate('/dashboard', { replace: true })
    }
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    const error = await signInWithGoogle()
    setIsLoading(false)
    if (error) toast.error(error.message)
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    setForgotFieldError('')
    if (!email.trim()) { setForgotFieldError('Email is required'); return }
    if (!isValidEmail(email)) { setForgotFieldError('Enter a valid email address'); return }

    setIsLoading(true)
    const { error } = await resetPassword(email)
    setIsLoading(false)

    if (error) {
      if (error.message.includes('rate limit')) {
        toast.error('Too many requests. Please try again later')
      } else {
        toast.error(error.message)
      }
    } else {
      setForgotSent(true)
      toast.success('Password reset email sent')
    }
  }

  const switchAuthTab = (tab) => {
    setAuthTab(tab)
    setFieldErrors({})
    if (tab === 'email') {
      setOtpSent(false)
      setOtp('')
    }
  }

  if (!isOpen) return null

  return (
    <div className="login-modal-overlay" onClick={closeLogin}>
      <div className="login-modal-backdrop" />
      <div className="login-modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="login-modal-close" onClick={closeLogin} aria-label="Close">
          <X size={20} />
        </button>

        {view === 'login' && (
          <>
            <h1 className="login-modal-title">Login</h1>

            <div className="auth-tabs">
              <button type="button" className={`tab-btn${authTab === 'email' ? ' active' : ''}`} onClick={() => switchAuthTab('email')}>
                Email
              </button>
              <button type="button" className={`tab-btn${authTab === 'phone' ? ' active' : ''}`} onClick={() => switchAuthTab('phone')}>
                Phone
              </button>
            </div>

            {authTab === 'email' && (
              <form onSubmit={handleEmailLogin} className="auth-form" noValidate>
                <label htmlFor="modal-email">Email</label>
                <input id="modal-email" type="email" value={email} onChange={(e) => { setEmail(e.target.value); setFieldErrors((p) => ({ ...p, email: '' })) }} placeholder="you@example.com" autoComplete="email" />
                {fieldErrors.email && <p className="field-error">{fieldErrors.email}</p>}

                <label htmlFor="modal-password">Password</label>
                <div className="input-wrapper">
                  <input id="modal-password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => { setPassword(e.target.value); setFieldErrors((p) => ({ ...p, password: '' })) }} placeholder="Enter password" autoComplete="current-password" />
                  <button type="button" className="visibility-toggle" onClick={() => setShowPassword((p) => !p)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
                {fieldErrors.password && <p className="field-error">{fieldErrors.password}</p>}

                <button type="submit" disabled={isLoading} className="btn-primary">
                  {isLoading ? 'Logging in...' : 'Login'}
                </button>
              </form>
            )}

            {authTab === 'phone' && !otpSent && (
              <form onSubmit={handleSendOtp} className="auth-form" noValidate>
                <label htmlFor="modal-phone">Phone Number</label>
                <input id="modal-phone" type="tel" value={phone} onChange={(e) => { setPhone(e.target.value); setFieldErrors((p) => ({ ...p, phone: '' })) }} placeholder="+1234567890" autoComplete="tel" />
                {fieldErrors.phone && <p className="field-error">{fieldErrors.phone}</p>}
                <p className="input-hint">Include country code (e.g. +1 for US)</p>
                <button type="submit" disabled={isLoading} className="btn-primary">
                  {isLoading ? 'Sending...' : 'Send OTP'}
                </button>
              </form>
            )}

            {authTab === 'phone' && otpSent && (
              <form onSubmit={handleVerifyOtp} className="auth-form" noValidate>
                <label htmlFor="modal-otp">Enter OTP</label>
                <input id="modal-otp" type="text" inputMode="numeric" value={otp} onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); setFieldErrors((p) => ({ ...p, otp: '' })) }} placeholder="123456" autoComplete="one-time-code" />
                {fieldErrors.otp && <p className="field-error">{fieldErrors.otp}</p>}
                <p className="input-hint">Enter the 6-digit code sent to your phone</p>
                <button type="submit" disabled={isLoading} className="btn-primary">
                  {isLoading ? 'Verifying...' : 'Verify OTP'}
                </button>
                <button type="button" className="btn-ghost" onClick={() => { setOtpSent(false); setOtp(''); setFieldErrors({}) }}>
                  Change phone number
                </button>
              </form>
            )}

            <div className="auth-divider"><span>or</span></div>
            <button type="button" className="google-btn" onClick={handleGoogleLogin} disabled={isLoading}>
              <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
              Continue with Google
            </button>

            <div className="auth-links">
              <button type="button" className="auth-link-btn" onClick={() => switchView('forgot')}>Forgot password?</button>
            </div>

            <p className="auth-switch">
              Don&apos;t have an account?{' '}
              <button type="button" className="auth-link-btn" onClick={() => switchView('signup')}>Sign up</button>
            </p>
          </>
        )}

        {view === 'signup' && (
          <>
            <h1 className="login-modal-title">Create Account</h1>

            <div className="auth-tabs">
              <button type="button" className={`tab-btn${authTab === 'email' ? ' active' : ''}`} onClick={() => switchAuthTab('email')}>
                Email
              </button>
              <button type="button" className={`tab-btn${authTab === 'phone' ? ' active' : ''}`} onClick={() => switchAuthTab('phone')}>
                Phone
              </button>
            </div>

            {authTab === 'email' && (
              <form onSubmit={handleSignUp} className="auth-form" noValidate>
                <label htmlFor="modal-signup-email">Email</label>
                <input id="modal-signup-email" type="email" value={email} onChange={(e) => { setEmail(e.target.value); clearError('email') }} placeholder="you@example.com" autoComplete="email" />
                {fieldErrors.email && <p className="field-error">{fieldErrors.email}</p>}

                <label htmlFor="modal-signup-password">Password</label>
                <div className="input-wrapper">
                  <input id="modal-signup-password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => { setPassword(e.target.value); clearError('password') }} placeholder="Create a password" autoComplete="new-password" />
                  <button type="button" className="visibility-toggle" onClick={() => setShowPassword((p) => !p)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
                {fieldErrors.password && <p className="field-error">{fieldErrors.password}</p>}

                {password && (
                  <div className="password-strength">
                    <div className="strength-bar" style={{ width: strength.width, backgroundColor: strength.color }} />
                    <span className="strength-label" style={{ color: strength.color }}>{strength.label}</span>
                  </div>
                )}

                <label htmlFor="modal-signup-confirm">Confirm Password</label>
                <div className="input-wrapper">
                  <input id="modal-signup-confirm" type={showConfirm ? 'text' : 'password'} value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); clearError('confirmPassword') }} placeholder="Re-enter password" autoComplete="new-password" />
                  <button type="button" className="visibility-toggle" onClick={() => setShowConfirm((p) => !p)} aria-label={showConfirm ? 'Hide password' : 'Show password'}>
                    <EyeIcon open={showConfirm} />
                  </button>
                </div>
                {fieldErrors.confirmPassword && <p className="field-error">{fieldErrors.confirmPassword}</p>}

                {password && confirmPassword && password !== confirmPassword && (
                  <p className="field-error">Passwords do not match</p>
                )}

                <button type="submit" disabled={isLoading} className="btn-primary">
                  {isLoading ? 'Creating account...' : 'Create Account'}
                </button>
              </form>
            )}

            {authTab === 'phone' && !otpSent && (
              <form onSubmit={handleSendOtp} className="auth-form" noValidate>
                <label htmlFor="modal-signup-phone">Phone Number</label>
                <input id="modal-signup-phone" type="tel" value={phone} onChange={(e) => { setPhone(e.target.value); clearError('phone') }} placeholder="+1234567890" autoComplete="tel" />
                {fieldErrors.phone && <p className="field-error">{fieldErrors.phone}</p>}
                <p className="input-hint">Include country code (e.g. +1 for US)</p>
                <button type="submit" disabled={isLoading} className="btn-primary">
                  {isLoading ? 'Sending...' : 'Send OTP'}
                </button>
              </form>
            )}

            {authTab === 'phone' && otpSent && (
              <form onSubmit={handleVerifyOtp} className="auth-form" noValidate>
                <label htmlFor="modal-signup-otp">Enter OTP</label>
                <input id="modal-signup-otp" type="text" inputMode="numeric" value={otp} onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); clearError('otp') }} placeholder="123456" autoComplete="one-time-code" />
                {fieldErrors.otp && <p className="field-error">{fieldErrors.otp}</p>}
                <p className="input-hint">Enter the 6-digit code sent to your phone</p>
                <button type="submit" disabled={isLoading} className="btn-primary">
                  {isLoading ? 'Verifying...' : 'Verify OTP'}
                </button>
                <button type="button" className="btn-ghost" onClick={() => { setOtpSent(false); setOtp(''); setFieldErrors({}) }}>
                  Change phone number
                </button>
              </form>
            )}

            <div className="auth-divider"><span>or</span></div>
            <button type="button" className="google-btn" onClick={handleGoogleLogin} disabled={isLoading}>
              <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
              Continue with Google
            </button>

            <p className="auth-switch">
              Already have an account?{' '}
              <button type="button" className="auth-link-btn" onClick={() => switchView('login')}>Login</button>
            </p>
          </>
        )}

        {view === 'forgot' && (
          <>
            {!forgotSent ? (
              <>
                <h1 className="login-modal-title">Forgot Password</h1>
                <p className="page-description" style={{ marginBottom: '1rem' }}>Enter your email and we&apos;ll send you a reset link.</p>

                <form onSubmit={handleForgotPassword} className="auth-form" noValidate>
                  <label htmlFor="modal-forgot-email">Email</label>
                  <input id="modal-forgot-email" type="email" value={email} onChange={(e) => { setEmail(e.target.value); setForgotFieldError('') }} placeholder="you@example.com" autoComplete="email" />
                  {forgotFieldError && <p className="field-error">{forgotFieldError}</p>}

                  <button type="submit" disabled={isLoading} className="btn-primary">
                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </form>

                <p className="auth-switch">
                  Remember your password?{' '}
                  <button type="button" className="auth-link-btn" onClick={() => switchView('login')}>Login</button>
                </p>
              </>
            ) : (
              <div className="success-card" style={{ padding: '1rem 0' }}>
                <h2>Check your email</h2>
                <p>If an account exists with that email, we&apos;ve sent a password reset link.</p>
                <p className="auth-switch" style={{ marginTop: '1rem' }}>
                  <button type="button" className="auth-link-btn" onClick={() => switchView('login')}>Back to login</button>
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
