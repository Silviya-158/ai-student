"use client"
import { useState, useRef, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import MessageBubble from './MessageBubble'

export default function ChatBox({ conversationId }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const containerRef = useRef()
  const searchParams = useSearchParams()
  const router = useRouter()
  const triggerQuiz = searchParams.get('triggerQuiz')

  // Load conversation messages from localStorage on ID change
  useEffect(() => {
    if (!conversationId) return
    let msgs = []
    try {
      const convs = JSON.parse(localStorage.getItem('ai_chat_conversations') || '[]')
      const conv = convs.find(c => c.id === conversationId)
      msgs = conv ? (conv.messages || []) : []
      setMessages(msgs)
    } catch (e) {
      setMessages([])
      msgs = []
    }

    if (triggerQuiz === 'true' && msgs.length === 0) {
      // Clean query parameter
      const params = new URLSearchParams(window.location.search)
      params.delete('triggerQuiz')
      const newQuery = params.toString() ? `?${params.toString()}` : ''
      router.replace(`/chat${newQuery}`)

      // Trigger quiz message sending
      setTimeout(() => {
        send("Generate 5 multiple-choice questions with answers based on the uploaded files to test my understanding.")
      }, 200)
    }
  }, [conversationId, triggerQuiz])

  // Scroll to bottom when messages or loading changes
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [messages, loading])

  function persistMessages(msgs) {
    try {
      const convs = JSON.parse(localStorage.getItem('ai_chat_conversations') || '[]')
      const idx = convs.findIndex(c => c.id === conversationId)
      if (idx !== -1) {
        convs[idx].messages = msgs
        localStorage.setItem('ai_chat_conversations', JSON.stringify(convs))
      }
    } catch (e) {
      console.error(e)
    }
  }

  async function send(queryText = null) {
    const textToSend = (queryText || input).trim()
    if (!textToSend || !conversationId || loading) return
    
    const userMsg = { id: Date.now(), from: 'user', text: textToSend }
    const next = [...messages, userMsg]
    
    setMessages(next)
    setInput('')
    setLoading(true)
    persistMessages(next)

    try {
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || '') + '/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMsg.text })
      })
      
      if (!res.ok) {
        throw new Error('Server returned error ' + res.status)
      }
      
      const j = await res.json()
      
      const botMsg = { 
        id: Date.now() + 1, 
        from: 'bot', 
        text: j.answer || j.message || 'No answer.'
      }
      
      const next2 = [...next, botMsg]
      setMessages(next2)
      persistMessages(next2)
    } catch (e) {
      console.error(e)
      const errMsg = { 
        id: Date.now() + 2, 
        from: 'bot', 
        text: 'Could not reach the server. Make sure the backend is running and Groq API keys are set.' 
      }
      const next2 = [...next, errMsg]
      setMessages(next2)
      persistMessages(next2)
    }
    setLoading(false)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { 
      e.preventDefault(); 
      send() 
    }
  }

  const suggestions = [
    {
      title: "📋 Summarize Key Concepts",
      desc: "Get a comprehensive summary of themes from my index.",
      prompt: "Summarize the key concepts and main ideas presented in my uploaded files."
    },
    {
      title: "❓ Quiz Me",
      desc: "Generate 5 practice questions to test my retention.",
      prompt: "Generate 5 multiple-choice questions with answers based on the uploaded files to test my understanding."
    },
    {
      title: "🔑 Define Key Terms",
      desc: "Extract and define important terminology.",
      prompt: "Identify the most important technical terms or definitions in the files and list them."
    },
    {
      title: "⚡ Explain Simply",
      desc: "Explain complex concepts like I am 5 years old.",
      prompt: "Explain the main difficult concepts in the uploaded materials in simple terms, like I am 5 years old."
    }
  ]

  return (
    <div className="chat-layout">
      {/* Centered Chat Workspace */}
      <div className="chat-panel">
        <div className="chat-card">
          <div className="messages" ref={containerRef}>
            {messages.length === 0 && !loading && (
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                height: '100%', minHeight: '380px', gap: '8px', color: 'var(--text-muted)'
              }}>
                <span style={{ fontSize: '3rem', userSelect: 'none' }}>✨</span>
                <span style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--text-bright)' }}>AI Study Assistant Workspace</span>
                <span style={{ fontSize: '0.84rem', maxWidth: '340px', textAlign: 'center', lineHeight: '1.6', marginBottom: '8px' }}>
                  Ask questions, summarize documents, or run quick actions on your library.
                </span>

                {/* Suggested prompt chips */}
                <div className="empty-chat-suggestions">
                  {suggestions.map((s, idx) => (
                    <button 
                      key={idx}
                      className="suggestion-card"
                      onClick={() => send(s.prompt)}
                    >
                      <strong>{s.title}</strong>
                      <span>{s.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {messages.map(m => (
              <MessageBubble 
                key={m.id} 
                from={m.from} 
                text={m.text} 
              />
            ))}
            
            {loading && (
              <div className="message-container from-bot">
                <div className="message-avatar">✨</div>
                <div className="message-bubble from-bot" style={{ opacity: 1 }}>
                  <div className="loading-dots">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="chat-controls-container">
            <div className="chat-input-wrapper">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your study materials..."
                disabled={loading}
              />
              <button className="send-pill" onClick={() => send()} disabled={loading || !input.trim()}>
                Send
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
