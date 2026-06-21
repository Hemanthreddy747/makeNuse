import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Send, Bot, User, ArrowRight, Save, Settings, X, Eye, Code, Plus } from 'lucide-react'
import { setPushedPage, savePage, setPageSlot } from '../../lib/pageStore'
import { getSettings, saveSettings, getModels, getEndpoint, getProvider } from '../../lib/aiSettings'
import './MakePage.css'

function AiSettingsModal({ open, onClose }) {
  const [settings, setSettings] = useState(getSettings())
  const models = getModels()

  const handleSave = () => {
    saveSettings(settings)
    onClose()
  }

  if (!open) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>AI Settings</h2>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="modal-body">
          <label className="modal-label">Model</label>
          <select className="modal-select" value={settings.model} onChange={(e) => setSettings({ ...settings, model: e.target.value })}>
            {getModels().map((m) => (
              <option key={m.id} value={m.id}>{m.name} ({m.provider})</option>
            ))}
          </select>
          <label className="modal-label">API Key</label>
          <input className="modal-input" type="password" value={settings.apiKey} onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })} placeholder="sk-..." />
          <p className="modal-hint">Stored locally in your browser.</p>
        </div>
        <div className="modal-footer">
          <button className="modal-btn-primary" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  )
}

function PreviewModal({ code, name, open, onClose }) {
  if (!open) return null

  return (
    <div className="preview-overlay" onClick={onClose}>
      <div className="preview-bar">
        <span>{name || 'Preview'}</span>
        <div className="preview-bar-actions">
          <button className="preview-close-btn" onClick={onClose}><X size={20} /></button>
        </div>
      </div>
      <iframe srcDoc={code} title="preview" className="preview-iframe" sandbox="allow-scripts" onClick={(e) => e.stopPropagation()} />
    </div>
  )
}

export default function MakePage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('chat')
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Describe the page you want to build. I will generate the code for you.' },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [generatedCode, setGeneratedCode] = useState(null)
  const [showSettings, setShowSettings] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [pasteCode, setPasteCode] = useState('')
  const [pasteName, setPasteName] = useState('')
  const [showDestPicker, setShowDestPicker] = useState(false)
  const [newSlotName, setNewSlotName] = useState('')
  const [showNewSlot, setShowNewSlot] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMsg = { role: 'user', content: input.trim() }
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setInput('')
    setLoading(true)

    const settings = getSettings()
    const { model, apiKey } = settings
    const provider = getProvider(model)
    const endpoint = getEndpoint(model)

    const systemPrompt = {
      role: 'system',
      content: 'You are a code generator. Generate a complete self-contained HTML page for the request. Output only the HTML code inside a single code block marked with ```html. The HTML must include embedded CSS in a <style> tag. Use modern, clean design. Make it visually impressive with gradients, animations, and good spacing. Everything must be inline — no external files or imports.',
    }

    try {
      let reply = ''

      if (provider === 'openai') {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({ model, messages: [systemPrompt, ...updatedMessages].map((m) => ({ role: m.role, content: m.content })) }),
        })
        const data = await res.json()
        reply = data.choices?.[0]?.message?.content || 'Sorry, I could not process that.'
      } else if (provider === 'anthropic') {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
          body: JSON.stringify({ model, max_tokens: 4096, system: systemPrompt.content, messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })) }),
        })
        const data = await res.json()
        reply = data.content?.[0]?.text || 'Sorry, I could not process that.'
      } else if (provider === 'google') {
        const contents = [{ role: 'user', parts: [{ text: systemPrompt.content + '\n\n' + updatedMessages.map((m) => `${m.role}: ${m.content}`).join('\n') }] }]
        const res = await fetch(`${endpoint}?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents }),
        })
        const data = await res.json()
        reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not process that.'
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: reply }])

      const codeMatch = reply.match(/```html\n?([\s\S]*?)```/) || reply.match(/```jsx\n?([\s\S]*?)```/)
      if (codeMatch) {
        setGeneratedCode({ code: codeMatch[1].trim(), name: input.trim().slice(0, 40) })
      }
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Error connecting to AI. Check your API key and model settings.' }])
    }

    setLoading(false)
  }

  const handleUsePaste = () => {
    if (!pasteCode.trim()) return
    setGeneratedCode({ code: pasteCode.trim(), name: pasteName.trim() || 'Custom Paste' })
  }

  const handlePush = () => {
    if (!generatedCode) return
    setPushedPage(generatedCode)
    navigate('/page1')
  }

  const handleSaveNew = () => {
    if (!generatedCode) return
    savePage(generatedCode)
    setGeneratedCode(null)
    setPasteCode('')
    setPasteName('')
    setMessages((prev) => [...prev, { role: 'assistant', content: 'Page saved! View it in Page 2.' }])
  }

  const handlePushToSlot = (name) => {
    if (!generatedCode) return
    setPageSlot(name, generatedCode)
    navigate(`/page/${encodeURIComponent(name)}`)
  }

  const handleCreateSlot = () => {
    if (!newSlotName.trim() || !generatedCode) return
    setPageSlot(newSlotName.trim(), generatedCode)
    setShowNewSlot(false)
    setNewSlotName('')
    navigate(`/page/${encodeURIComponent(newSlotName.trim())}`)
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
        <div className="make-header-row">
          <div>
            <h1>Make</h1>
            <p className="page-subtitle">Describe a page, paste HTML, and send it anywhere.</p>
          </div>
          <button className="make-settings-btn" onClick={() => setShowSettings(true)} title="AI Settings">
            <Settings size={20} />
          </button>
        </div>
      </div>

      <div className="make-tabs">
        <button className={`make-tab${tab === 'chat' ? ' active' : ''}`} onClick={() => setTab('chat')}>
          <Bot size={16} /> Chat
        </button>
        <button className={`make-tab${tab === 'paste' ? ' active' : ''}`} onClick={() => setTab('paste')}>
          <Code size={16} /> Paste HTML
        </button>
      </div>

      {tab === 'chat' ? (
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
              placeholder="Describe the page you want..."
              rows={1}
            />
            <button className="chat-send-btn" onClick={handleSend} disabled={!input.trim() || loading}>
              <Send size={18} />
            </button>
          </div>
        </div>
      ) : (
        <div className="paste-container">
          <div className="paste-area">
            <textarea
              className="paste-textarea"
              value={pasteCode}
              onChange={(e) => setPasteCode(e.target.value)}
              placeholder="Paste your HTML code here..."
              spellCheck={false}
            />
          </div>
          <div className="paste-footer">
            <input
              className="paste-name-input"
              value={pasteName}
              onChange={(e) => setPasteName(e.target.value)}
              placeholder="Page name (optional)"
            />
            <button className="paste-use-btn" onClick={handleUsePaste} disabled={!pasteCode.trim()}>
              <Eye size={16} /> Use
            </button>
          </div>
        </div>
      )}

      {generatedCode && (
        <div className="make-actions">
          <button className="make-action-btn make-action-btn--view" onClick={() => setShowPreview(true)}>
            <Eye size={16} /> View
          </button>
          <div className="make-action-group">
            <button className="make-action-btn make-action-btn--push" onClick={handlePush}>
              <ArrowRight size={16} /> Page 1
            </button>
            <button className="make-action-btn make-action-btn--save" onClick={handleSaveNew}>
              <Save size={16} /> Save
            </button>
            <button className="make-action-btn make-action-btn--slot" onClick={() => setShowDestPicker(!showDestPicker)}>
              <Plus size={16} /> Send to...
            </button>
          </div>
        </div>
      )}

      {showDestPicker && (
        <div className="dest-picker">
          <input
            className="dest-picker-input"
            value={newSlotName}
            onChange={(e) => setNewSlotName(e.target.value)}
            placeholder="New page name..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateSlot()
            }}
          />
          <div className="dest-picker-actions">
            <button className="dest-picker-btn" onClick={handleCreateSlot} disabled={!newSlotName.trim()}>
              <Plus size={14} /> Create & Push
            </button>
            <button className="dest-picker-btn dest-picker-btn--cancel" onClick={() => setShowDestPicker(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <p className="make-hint">Configure your AI model and API key in <strong>Settings</strong> <Settings size={12} style={{ display: 'inline', verticalAlign: 'middle' }} />.</p>

      <AiSettingsModal open={showSettings} onClose={() => setShowSettings(false)} />
      <PreviewModal code={generatedCode?.code} name={generatedCode?.name} open={showPreview} onClose={() => setShowPreview(false)} />
    </div>
  )
}
