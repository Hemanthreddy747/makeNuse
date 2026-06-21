import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User } from 'lucide-react'
import './MakePage.css'

export default function MakePage() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! How can I help you today?' },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMsg = { role: 'user', content: input.trim() }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
      }),
    })

    const data = await response.json()
    const reply = data.choices?.[0]?.message?.content || 'Sorry, I could not process that.'

    setMessages((prev) => [...prev, { role: 'assistant', content: reply }])
    setLoading(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="make-page">
      <div className="make-header">
        <h1>AI Chat</h1>
        <p className="page-subtitle">Chat with the assistant. Set <code>VITE_OPENAI_API_KEY</code> in your <code>.env</code> to enable.</p>
      </div>

      <div className="chat-container">
        <div className="chat-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`chat-msg chat-msg--${msg.role}`}>
              <div className="chat-avatar">
                {msg.role === 'assistant' ? <Bot size={18} /> : <User size={18} />}
              </div>
              <div className="chat-bubble">{msg.content}</div>
            </div>
          ))}
          {loading && (
            <div className="chat-msg chat-msg--assistant">
              <div className="chat-avatar"><Bot size={18} /></div>
              <div className="chat-bubble chat-bubble--typing">
                <span className="dot" /><span className="dot" /><span className="dot" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="chat-input-bar">
          <textarea
            className="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
          />
          <button className="chat-send-btn" onClick={handleSend} disabled={!input.trim() || loading}>
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
