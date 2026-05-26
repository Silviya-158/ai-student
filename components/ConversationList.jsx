"use client"
import { useState, useEffect } from 'react'

export default function ConversationList({ selectedId, onSelect }){
  const [convos, setConvos] = useState([])

  useEffect(()=>{
    try{
      const data = JSON.parse(localStorage.getItem('ai_chat_conversations') || '[]')
      setConvos(data)
    }catch(e){ setConvos([]) }
  },[])

  function newConv(){
    const id = Date.now().toString()
    const title = 'Conversation ' + (convos.length + 1)
    const item = { id, title, messages: [] }
    const next = [item, ...convos]
    localStorage.setItem('ai_chat_conversations', JSON.stringify(next))
    setConvos(next)
    if(onSelect) onSelect(id)
  }

  function del(id){
    const next = convos.filter(c => c.id !== id)
    localStorage.setItem('ai_chat_conversations', JSON.stringify(next))
    setConvos(next)
    if(onSelect && selectedId === id){
      onSelect(next[0] ? next[0].id : null)
    }
  }

  return (
    <aside className="conv-list">
      <div className="conv-header">
        <strong>Chats</strong>
        <button className="btn small primary" onClick={newConv}>+ New</button>
      </div>
      <div className="conv-items">
        {convos.length === 0 && <div className="muted" style={{padding:'16px',textAlign:'center'}}>No conversations yet</div>}
        {convos.map(c => (
          <div
            key={c.id}
            className={"conv-item " + (c.id === selectedId ? 'active' : '')}
            onClick={() => onSelect && onSelect(c.id)}
          >
            <div className="conv-title">{c.title}</div>
            <div className="conv-actions">
              <button className="btn small" onClick={(e) => { e.stopPropagation(); del(c.id) }}>✕</button>
            </div>
          </div>
        ))}
      </div>
    </aside>
  )
}
