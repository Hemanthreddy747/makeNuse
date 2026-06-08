import { createContext, useContext, useState, useCallback } from 'react'

const AuthModalContext = createContext(null)

export function LoginModalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false)
  const [view, setView] = useState('login')

  const openLogin = useCallback(() => { setView('login'); setIsOpen(true) }, [])
  const openSignup = useCallback(() => { setView('signup'); setIsOpen(true) }, [])
  const openForgotPassword = useCallback(() => { setView('forgot'); setIsOpen(true) }, [])
  const closeLogin = useCallback(() => setIsOpen(false), [])
  const switchView = useCallback((v) => setView(v), [])

  return (
    <AuthModalContext.Provider value={{ isOpen, view, openLogin, openSignup, openForgotPassword, closeLogin, switchView }}>
      {children}
    </AuthModalContext.Provider>
  )
}

export function useLoginModal() {
  const context = useContext(AuthModalContext)
  if (!context) {
    throw new Error('useLoginModal must be used within a LoginModalProvider')
  }
  return context
}
