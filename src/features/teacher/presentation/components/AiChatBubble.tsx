import { useState, useRef, useCallback, useEffect } from 'react'
import { aiApi } from '../../infrastructure/aiApi'
import '../styles/ai-chat-bubble.css'

type ChatMessage = {
  id: string
  role: 'bot' | 'user' | 'system'
  content: string
  type?: 'text' | 'options' | 'loading' | 'download' | 'error' | 'divider'
  blob?: Blob
}

type ChatPhase = 'menu' | 'input' | 'processing' | 'done'

function createWelcomeMessages(suffix = ''): ChatMessage[] {
  return [
    {
      id: `welcome${suffix}`,
      role: 'bot',
      content: 'Xin chào! Tôi là trợ lý AI của bạn. Hãy chọn chức năng bên dưới để bắt đầu 👇',
      type: 'text',
    },
    {
      id: `options${suffix}`,
      role: 'bot',
      content: '',
      type: 'options',
    },
  ]
}

export function AiChatBubble() {
  const [isOpen, setIsOpen] = useState(false)
  const [phase, setPhase] = useState<ChatPhase>('menu')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  // Drag state
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const dragRef = useRef<{
    startX: number
    startY: number
    startPosX: number
    startPosY: number
    hasMoved: boolean
  } | null>(null)
  const bubbleRef = useRef<HTMLButtonElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // Focus textarea
  useEffect(() => {
    if (phase === 'input') {
      setTimeout(() => textareaRef.current?.focus(), 120)
    }
  }, [phase])

  // ===== Panel open/close =====
  const openPanel = useCallback(() => {
    if (messages.length === 0) {
      setMessages(createWelcomeMessages())
      setPhase('menu')
    }
    setIsOpen(true)
  }, [messages])

  const closePanel = useCallback(() => {
    setIsClosing(true)
    setTimeout(() => {
      setIsOpen(false)
      setIsClosing(false)
    }, 200)
  }, [])

  // ===== New session =====
  const startNewSession = useCallback(() => {
    const ts = `-${Date.now()}`
    setMessages((prev) => [
      ...prev,
      { id: `divider${ts}`, role: 'system', content: 'Phiên mới', type: 'divider' },
      ...createWelcomeMessages(ts),
    ])
    setPhase('menu')
    setInputValue('')
    setIsLoading(false)
  }, [])

  // ===== Drag =====
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (isOpen) return
      const el = bubbleRef.current
      if (!el) return
      el.setPointerCapture(e.pointerId)
      setIsDragging(true)
      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        startPosX: position.x,
        startPosY: position.y,
        hasMoved: false,
      }
    },
    [isOpen, position],
  )

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return
    const dx = e.clientX - dragRef.current.startX
    const dy = e.clientY - dragRef.current.startY
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      dragRef.current.hasMoved = true
    }
    setPosition({
      x: dragRef.current.startPosX + dx,
      y: dragRef.current.startPosY + dy,
    })
  }, [])

  const handlePointerUp = useCallback(() => {
    const wasDragged = dragRef.current?.hasMoved ?? false
    dragRef.current = null
    setIsDragging(false)
    if (!wasDragged) {
      if (isOpen) closePanel()
      else openPanel()
    }
  }, [isOpen, closePanel, openPanel])

  // ===== Chat logic =====
  const handleSelectOption = useCallback(() => {
    setMessages((prev) => [
      ...prev.filter((m) => m.type !== 'options'),
      {
        id: `user-opt-${Date.now()}`,
        role: 'user',
        content: '📋 Tạo danh sách từ vựng Excel',
        type: 'text',
      },
      {
        id: `bot-guide-${Date.now()}`,
        role: 'bot',
        content: 'Nhập các từ vựng bạn muốn AI tra cứu.\nMỗi từ cách nhau bằng dấu phẩy hoặc xuống dòng.\n\nVí dụ: apple, book, characteristic',
        type: 'text',
      },
    ])
    setPhase('input')
  }, [])

  const handleSend = useCallback(async () => {
    const raw = inputValue.trim()
    if (!raw || isLoading) return

    const words = raw
      .split(/[,\n]+/)
      .map((w) => w.trim())
      .filter((w) => w.length > 0)

    if (words.length === 0) return
    if (words.length > 50) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'bot',
          content: '⚠️ Tối đa 50 từ mỗi lần. Vui lòng giảm bớt.',
          type: 'error',
        },
      ])
      return
    }

    setMessages((prev) => [
      ...prev,
      { id: `user-w-${Date.now()}`, role: 'user', content: words.join(', '), type: 'text' },
    ])
    setInputValue('')
    setIsLoading(true)
    setPhase('processing')

    try {
      const blob = await aiApi.generateVocabularyExcel(words)
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-ok-${Date.now()}`,
          role: 'bot',
          content: `✅ Đã tạo xong file Excel với ${words.length} từ vựng!`,
          type: 'text',
        },
        { id: `dl-${Date.now()}`, role: 'bot', content: '', type: 'download', blob },
      ])
      setPhase('done')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Có lỗi xảy ra'
      setMessages((prev) => [
        ...prev,
        { id: `err-${Date.now()}`, role: 'bot', content: `❌ ${msg}`, type: 'error' },
      ])
      setPhase('input')
    } finally {
      setIsLoading(false)
    }
  }, [inputValue, isLoading])

  const handleDownload = useCallback((blob: Blob) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ai-vocabulary-${new Date().toISOString().slice(0, 10)}.xlsx`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend],
  )

  // ===== Styles =====
  const bubbleStyle: React.CSSProperties = {
    transform: `translate(${position.x}px, ${position.y}px)`,
    transition: isDragging ? 'none' : undefined,
  }

  const panelStyle: React.CSSProperties = {
    bottom: `calc(28px - ${position.y}px + 68px)`,
    right: `calc(28px - ${position.x}px)`,
  }

  return (
    <>
      {/* Bubble */}
      <button
        ref={bubbleRef}
        className="ai-bubble"
        style={bubbleStyle}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        aria-label="Mở trợ lý AI"
        id="ai-chat-bubble"
      >
        <span className="material-symbols-outlined ai-bubble__icon" aria-hidden="true">
          {isOpen ? 'close' : 'auto_awesome'}
        </span>
      </button>

      {/* Panel */}
      {isOpen && (
        <div
          className={`ai-chat-panel ${isClosing ? 'ai-chat-panel--closing' : ''}`}
          style={panelStyle}
          id="ai-chat-panel"
        >
          {/* Header */}
          <div className="ai-chat-header">
            <div className="ai-chat-header__avatar">
              <span className="material-symbols-outlined" aria-hidden="true">smart_toy</span>
            </div>
            <div className="ai-chat-header__info">
              <p className="ai-chat-header__title">AI Trợ lý từ vựng</p>
              <p className="ai-chat-header__subtitle">Hỗ trợ tạo file Excel tự động</p>
            </div>
            <div className="ai-chat-header__actions">
              <button
                className="ai-chat-header__btn"
                onClick={startNewSession}
                aria-label="Phiên mới"
                title="Tạo phiên mới"
              >
                <span className="material-symbols-outlined" aria-hidden="true">add_comment</span>
              </button>
              <button
                className="ai-chat-header__btn"
                onClick={closePanel}
                aria-label="Đóng"
                title="Đóng"
              >
                <span className="material-symbols-outlined" aria-hidden="true">close</span>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="ai-chat-messages">
            {messages.map((msg) => {
              if (msg.type === 'divider') {
                return (
                  <div key={msg.id} className="ai-session-divider">
                    {msg.content}
                  </div>
                )
              }

              if (msg.type === 'options') {
                return (
                  <div key={msg.id} className="ai-msg ai-msg--bot">
                    <div style={{ marginBottom: 6 }}>Bạn cần tôi giúp gì?</div>
                    <div className="ai-options">
                      <button className="ai-option-btn" onClick={handleSelectOption} id="ai-option-vocabulary">
                        <span className="material-symbols-outlined" aria-hidden="true">table_chart</span>
                        Tạo danh sách từ vựng Excel
                      </button>
                    </div>
                  </div>
                )
              }

              if (msg.type === 'download' && msg.blob) {
                return (
                  <div key={msg.id} className="ai-msg ai-msg--bot">
                    <button className="ai-download-btn" onClick={() => handleDownload(msg.blob!)} id="ai-download-btn">
                      <span className="material-symbols-outlined" aria-hidden="true">download</span>
                      Tải xuống file Excel
                    </button>
                    <button className="ai-new-session-btn" onClick={startNewSession}>
                      <span className="material-symbols-outlined" aria-hidden="true">add_comment</span>
                      Tạo phiên mới
                    </button>
                  </div>
                )
              }

              return (
                <div
                  key={msg.id}
                  className={`ai-msg ${
                    msg.role === 'bot'
                      ? msg.type === 'error' ? 'ai-msg--error' : 'ai-msg--bot'
                      : 'ai-msg--user'
                  }`}
                >
                  {msg.content.split('\n').map((line, i, arr) => (
                    <span key={i}>
                      {line}
                      {i < arr.length - 1 && <br />}
                    </span>
                  ))}
                </div>
              )
            })}

            {isLoading && (
              <div className="ai-loading">
                <div className="ai-loading__dots">
                  <span className="ai-loading__dot" />
                  <span className="ai-loading__dot" />
                  <span className="ai-loading__dot" />
                </div>
                <span className="ai-loading__text">AI đang tra cứu từ vựng...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          {(phase === 'input' || phase === 'done') && (
            <div className="ai-chat-input">
              <div className="ai-chat-input__wrapper">
                <textarea
                  ref={textareaRef}
                  className="ai-chat-input__textarea"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Nhập từ vựng, phân cách bằng dấu phẩy..."
                  rows={2}
                  disabled={isLoading}
                  id="ai-chat-input"
                />
                <button
                  className="ai-chat-input__send"
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isLoading}
                  aria-label="Gửi"
                  id="ai-chat-send"
                >
                  <span className="material-symbols-outlined" aria-hidden="true">send</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}
