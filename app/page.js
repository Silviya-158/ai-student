"use client"
import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function Home() {
  const [stats, setStats] = useState({
    docsCount: 0,
    chatsCount: 0,
    apiStatus: 'Checking...'
  })

  useEffect(() => {
    try {
      const savedDocs = JSON.parse(localStorage.getItem('ai_upload_history') || '[]')
      const savedChats = JSON.parse(localStorage.getItem('ai_chat_conversations') || '[]')
      
      setStats({
        docsCount: savedDocs.length,
        chatsCount: savedChats.length,
        apiStatus: 'Active'
      })
    } catch (e) {
      setStats({ docsCount: 0, chatsCount: 0, apiStatus: 'Active' })
    }
  }, [])

  const studyTips = [
    {
      title: "Start by Indexing Documents",
      text: "Go to the Library page to upload textbooks or articles. The system will parse, split, and vectorize them into the vector database."
    },
    {
      title: "Query with Context",
      text: "Ask questions that point to specific topics, formulas, or theorems. RAG will retrieve the most similar sections to guide the answer."
    },
    {
      title: "Inspect RAG Sources",
      text: "While chatting, expand the RAG Reference Inspector on the right to read the actual textbook segments the AI referenced."
    },
    {
      title: "Organize with Conversations",
      text: "Create distinct chats for different courses or papers in the sidebar to keep your study sessions organized."
    }
  ]

  return (
    <section className="home-hero">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="welcome-text">
          <h1>Welcome, Scholar</h1>
          <p>
            Welcome to your AI-powered study space. Connect textbooks and papers to Groq LLM using Retrieval Augmented Generation (RAG) for instant, source-backed learning.
          </p>
        </div>
        <div style={{ fontSize: '4.5rem', userSelect: 'none' }}>🧠</div>
      </div>

      {/* Live Statistics */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon">📄</div>
          <div className="stat-info">
            <span className="stat-val">{stats.docsCount}</span>
            <span className="stat-lbl">Indexed Documents</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💬</div>
          <div className="stat-info">
            <span className="stat-val">{stats.chatsCount}</span>
            <span className="stat-lbl">Study Conversations</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ color: 'var(--success)' }}>⚡</div>
          <div className="stat-info">
            <span className="stat-val" style={{ color: 'var(--success)', fontSize: '1.4rem', fontWeight: 700 }}>
              {stats.apiStatus}
            </span>
            <span className="stat-lbl">RAG Engine Status</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Quick Actions & Tips */}
      <div className="dashboard-grid">
        {/* Quick Actions */}
        <div className="dashboard-panel">
          <h2>Quick Actions</h2>
          <div className="home-cards">
            <Link href="/upload" className="feature-card">
              <div className="feature-icon">📁</div>
              <h3>Manage Library</h3>
              <p>Upload new lecture slides, textbooks, or notes, and index them instantly.</p>
            </Link>
            <Link href="/chat" className="feature-card">
              <div className="feature-icon">💬</div>
              <h3>Open Chat Workspace</h3>
              <p>Ask questions and chat with the AI about your uploaded study materials.</p>
            </Link>
          </div>
        </div>

        {/* RAG study tips */}
        <div className="dashboard-panel">
          <h2>RAG Study Guide</h2>
          <div className="tips-list">
            {studyTips.map((tip, i) => (
              <div key={i} className="tip-item">
                <span className="tip-bullet">💡</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <strong style={{ color: 'var(--text-bright)', fontSize: '0.85rem' }}>{tip.title}</strong>
                  <span style={{ fontSize: '0.8rem' }}>{tip.text}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
