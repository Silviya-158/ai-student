"use client"
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeChatId = searchParams.get('id')

  const [docs, setDocs] = useState([])
  const [convos, setConvos] = useState([])

  // Load documents and conversations from localStorage
  const loadData = () => {
    try {
      const savedDocs = JSON.parse(localStorage.getItem('ai_upload_history') || '[]')
      setDocs(savedDocs.slice(0, 5)) // Show last 5 docs

      const savedConvs = JSON.parse(localStorage.getItem('ai_chat_conversations') || '[]')
      setConvos(savedConvs)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
    // Poll for changes in case files or chats update on other pages
    const interval = setInterval(loadData, 2000)
    return () => clearInterval(interval)
  }, [])

  // Create new conversation
  const createNewChat = () => {
    const id = Date.now().toString()
    const title = `Conversation ${convos.length + 1}`
    const newChat = {
      id,
      title,
      messages: [
        {
          id: Date.now() + 1,
          from: 'bot',
          text: "Hi there! 👋 I've loaded your vector index. Ask me anything about your study materials!"
        }
      ]
    }
    const updated = [newChat, ...convos]
    localStorage.setItem('ai_chat_conversations', JSON.stringify(updated))
    setConvos(updated)
    router.push(`/chat?id=${id}`)
  }

  const createQuizChat = (docName) => {
    const id = Date.now().toString()
    const title = `Quiz: ${docName.replace(/\.[^/.]+$/, "")}`
    const newChat = {
      id,
      title,
      messages: []
    }
    const updated = [newChat, ...convos]
    localStorage.setItem('ai_chat_conversations', JSON.stringify(updated))
    setConvos(updated)
    router.push(`/chat?id=${id}&triggerQuiz=true`)
  }

  // Delete conversation
  const deleteChat = (e, id) => {
    e.stopPropagation()
    const updated = convos.filter(c => c.id !== id)
    localStorage.setItem('ai_chat_conversations', JSON.stringify(updated))
    setConvos(updated)
    
    // Redirect logic if the deleted chat was active
    if (activeChatId === id) {
      if (updated.length > 0) {
        router.push(`/chat?id=${updated[0].id}`)
      } else {
        router.push('/chat')
      }
    }
  }

  const navItems = [
    {
      href: '/',
      label: 'Dashboard',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="9"/>
          <rect x="14" y="3" width="7" height="5"/>
          <rect x="14" y="12" width="7" height="9"/>
          <rect x="3" y="16" width="7" height="5"/>
        </svg>
      )
    },
    {
      href: '/upload',
      label: 'Upload Library',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
      )
    },
    {
      href: '/chat',
      label: 'Chat Workspace',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      )
    }
  ]

  return (
    <aside className="sidebar">
      {/* Branding */}
      <div className="sidebar-branding">
        <div className="sidebar-logo">S</div>
        <span className="sidebar-title">StudyBuddy AI</span>
      </div>

      {/* Main Navigation */}
      <nav className="sidebar-nav">
        {navItems.map(item => {
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href} className={`sidebar-nav-item ${isActive ? 'active' : ''}`}>
              {item.icon}
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Library Files Quick View */}
      <div className="sidebar-section">
        <div className="sidebar-section-title">Your Library</div>
        <div className="sidebar-doc-list">
          {docs.length === 0 ? (
            <div className="muted" style={{ padding: '8px 12px', fontSize: '0.78rem' }}>No PDFs indexed yet</div>
          ) : (
            docs.map((doc, idx) => (
              <div key={idx} className="sidebar-doc-item" title={doc.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', flex: 1, marginRight: '8px' }}>
                  <span style={{ color: 'var(--danger)', fontWeight: 700, fontSize: '0.72rem' }}>PDF</span>
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>
                    {doc.name}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    createQuizChat(doc.name)
                  }}
                  className="quiz-shortcut-btn"
                  title={`Generate MCQ Quiz on ${doc.name}`}
                >
                  ⚡ Quiz
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Conversations Quick Manager */}
      <div className="sidebar-section">
        <div className="sidebar-section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Recent Chats</span>
          <button 
            onClick={createNewChat} 
            className="btn small primary" 
            style={{ padding: '2px 8px', fontSize: '0.7rem', borderRadius: '4px' }}
          >
            + New
          </button>
        </div>
        <div className="conv-items" style={{ maxHeight: '180px' }}>
          {convos.length === 0 ? (
            <div className="muted" style={{ padding: '8px 12px', fontSize: '0.78rem' }}>No chats active</div>
          ) : (
            convos.map(c => {
              const isActive = pathname === '/chat' && activeChatId === c.id
              return (
                <div 
                  key={c.id} 
                  className={`conv-item ${isActive ? 'active' : ''}`}
                  onClick={() => router.push(`/chat?id=${c.id}`)}
                  style={{ padding: '6px 10px' }}
                >
                  <div className="conv-title" style={{ fontSize: '0.8rem' }}>{c.title}</div>
                  <div className="conv-actions">
                    <button onClick={(e) => deleteChat(e, c.id)}>✕</button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </aside>
  )
}
