"use client"
import { useState, useRef, useEffect } from 'react'

export default function UploadBox() {
  const [file, setFile] = useState(null)
  const [msg, setMsg] = useState('')
  const [msgType, setMsgType] = useState('')
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [recentFiles, setRecentFiles] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const inputRef = useRef()

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('ai_upload_history') || '[]')
      setRecentFiles(saved)
    } catch(e) { 
      setRecentFiles([]) 
    }
  }, [])

  function addToHistory(name, size) {
    const entry = { 
      name, 
      size, 
      date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
      status: 'Indexed' 
    }
    const next = [entry, ...recentFiles]
    setRecentFiles(next)
    localStorage.setItem('ai_upload_history', JSON.stringify(next))
  }

  function deleteFromHistory(e, idxToDelete) {
    e.stopPropagation()
    const next = recentFiles.filter((_, idx) => idx !== idxToDelete)
    setRecentFiles(next)
    localStorage.setItem('ai_upload_history', JSON.stringify(next))
  }

  function clearHistory() {
    if (confirm("Are you sure you want to clear your local upload history? This will only remove the list in this browser window, not the backend vector database.")) {
      setRecentFiles([])
      localStorage.setItem('ai_upload_history', JSON.stringify([]))
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if(!file) { 
      setMsg('Please choose a file first'); 
      setMsgType('error'); 
      return 
    }
    const fd = new FormData()
    fd.append('file', file)
    
    setMsg('')
    setMsgType('')
    setUploading(true)
    
    const base = process.env.NEXT_PUBLIC_API_URL || ''
    try {
      const res = await fetch(base + '/api/upload', { method: 'POST', body: fd })
      if(!res.ok) {
        const text = await res.text().catch(()=> '')
        setMsg('Upload failed: ' + res.status + ' ' + text)
        setMsgType('error')
        setUploading(false)
        return
      }
      const data = await res.json()
      setMsg(data.message || 'Uploaded and indexed successfully!')
      setMsgType('success')
      addToHistory(file.name, file.size)
      setFile(null)
      if(inputRef.current) inputRef.current.value = ''
    } catch(err) {
      console.error('Upload error', err)
      setMsg('Network error: ' + (err.message || String(err)))
      setMsgType('error')
    }
    setUploading(false)
  }

  function onFileChange(e) {
    if(e.target.files[0]) {
      setFile(e.target.files[0])
      setMsg(''); 
      setMsgType('')
    }
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if(f && f.type === 'application/pdf') {
      setFile(f)
      setMsg(''); 
      setMsgType('')
    } else {
      setMsg('Only PDF files are supported')
      setMsgType('error')
    }
  }

  function formatSize(bytes) {
    if(!bytes) return ''
    if(bytes < 1024) return bytes + ' B'
    if(bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / 1048576).toFixed(1) + ' MB'
  }

  // Filter files by search term
  const filteredFiles = recentFiles.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="upload-grid">
      {/* Left: Dropzone */}
      <div className="upload-left">
        <form onSubmit={handleSubmit}>
          <div
            className={`upload-dropzone ${dragOver ? 'drag-over' : ''} ${file ? 'has-file' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => !file && inputRef.current?.click()}
          >
            <input ref={inputRef} type="file" accept="application/pdf" onChange={onFileChange} style={{display:'none'}} />

            <div className="dropzone-glow"></div>

            {!file ? (
              <div className="dropzone-content">
                <div className="dropzone-icon-wrap">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                </div>
                <div className="dropzone-label">
                  <strong>Drag &amp; drop textbook or paper here</strong>
                  <span>or <em>browse your files</em></span>
                </div>
                <div className="dropzone-supported">Supported formats: PDF (Max 50MB)</div>
              </div>
            ) : (
              <div className="dropzone-selected">
                <div className="selected-file-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                </div>
                <div className="selected-file-info">
                  <strong>{file.name}</strong>
                  <span>{formatSize(file.size)}</span>
                </div>
                <button type="button" className="selected-file-remove" onClick={(e) => {
                  e.stopPropagation()
                  setFile(null)
                  if(inputRef.current) inputRef.current.value = ''
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            )}
          </div>

          <button className="upload-submit-btn" type="submit" disabled={uploading || !file}>
            {uploading ? (
              <>
                <span className="upload-spinner"></span>
                Parsing and Vectorizing PDF...
              </>
            ) : (
              'Index Document in RAG Database'
            )}
          </button>

          {msg && (
            <div className={`upload-toast ${msgType}`}>
              <span className="toast-icon">{msgType === 'success' ? '✓' : '!'}</span>
              <span>{msg}</span>
            </div>
          )}
        </form>

        <div className="upload-info-bar">
          <span>We split PDFs into overlapping chunks, generate embeddings, and save to your vector DB.</span>
        </div>
      </div>

      {/* Right: Recent Uploads */}
      <div className="upload-right">
        <div className="recent-uploads-card">
          <div className="recent-header">
            <strong>Vector Library</strong>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="recent-count">{recentFiles.length}</span>
              {recentFiles.length > 0 && (
                <button 
                  onClick={clearHistory}
                  className="btn small"
                  style={{ padding: '4px 8px', fontSize: '0.72rem', borderColor: 'rgba(244, 63, 94, 0.2)', color: 'var(--danger)' }}
                >
                  Clear History
                </button>
              )}
            </div>
          </div>
          
          {/* File Search */}
          {recentFiles.length > 0 && (
            <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)' }}>
              <input 
                type="text" 
                placeholder="Search indexed files..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 'var(--r-sm)',
                  border: '1px solid var(--border)',
                  background: 'rgba(0,0,0,0.2)',
                  color: 'var(--text-bright)',
                  fontSize: '0.82rem',
                  outline: 'none'
                }}
              />
            </div>
          )}

          <div className="recent-list">
            {recentFiles.length === 0 ? (
              <div className="recent-empty">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{opacity:0.3}}>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
                <span>No files in history</span>
              </div>
            ) : filteredFiles.length === 0 ? (
              <div className="recent-empty">
                <span>No files match your search</span>
              </div>
            ) : (
              filteredFiles.map((f, i) => (
                <div key={i} className="recent-item">
                  <div className="recent-item-icon">
                    <span className="pdf-badge">PDF</span>
                  </div>
                  <div className="recent-item-info">
                    <strong>{f.name}</strong>
                    <span style={{ fontSize: '0.74rem' }}>{formatSize(f.size)} • {f.date}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="status-badge">{f.status}</span>
                    <button 
                      onClick={(e) => deleteFromHistory(e, i)}
                      className="selected-file-remove"
                      style={{ width: '24px', height: '24px', borderRadius: '4px' }}
                      title="Remove from history"
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
