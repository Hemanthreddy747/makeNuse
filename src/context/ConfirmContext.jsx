import { createContext, useContext, useState, useCallback, useRef } from 'react'

const ConfirmContext = createContext()

export function ConfirmProvider({ children }) {
  const [state, setState] = useState({ open: false, message: '' })
  const resolveRef = useRef(null)

  const confirm = useCallback((message) => {
    setState({ open: true, message })
    return new Promise((resolve) => {
      resolveRef.current = resolve
    })
  }, [])

  const handleAnswer = useCallback((answer) => {
    setState({ open: false, message: '' })
    if (resolveRef.current) {
      resolveRef.current(answer)
      resolveRef.current = null
    }
  }, [])

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state.open && (
        <div className="confirm-overlay" onClick={() => handleAnswer(false)}>
          <div className="confirm-modal" onClick={e => e.stopPropagation()}>
            <p className="confirm-message">{state.message}</p>
            <div className="confirm-actions">
              <button className="confirm-btn confirm-btn-no" onClick={() => handleAnswer(false)}>
                No
              </button>
              <button className="confirm-btn confirm-btn-yes" onClick={() => handleAnswer(true)}>
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext)
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider')
  return ctx
}
