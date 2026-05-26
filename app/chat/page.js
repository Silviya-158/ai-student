"use client"
import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, Suspense } from 'react'
import ChatBox from '../../components/ChatBox'

function ChatPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const id = searchParams.get('id')

  useEffect(() => {
    // If no conversation ID in URL, select the first one or create a default conversation
    if (!id) {
      try {
        const convs = JSON.parse(localStorage.getItem('ai_chat_conversations') || '[]')
        if (convs.length) {
          router.replace(`/chat?id=${convs[0].id}`)
        } else {
          const defaultId = Date.now().toString()
          const item = {
            id: defaultId,
            title: 'Conversation 1',
            messages: [
              {
                id: Date.now() + 1,
                from: 'bot',
                text: "Hi there! 👋 I'm here to help you study! Upload a PDF to the Library first, then ask me anything about it."
              }
            ]
          }
          localStorage.setItem('ai_chat_conversations', JSON.stringify([item]))
          router.replace(`/chat?id=${defaultId}`)
        }
      } catch (e) {
        console.error(e)
      }
    }
  }, [id, router])

  return (
    <div style={{ height: '100%' }}>
      {id ? (
        <ChatBox conversationId={id} />
      ) : (
        <div className="muted" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
          Loading your workspace...
        </div>
      )}
    </div>
  )
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="muted" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>Loading...</div>}>
      <ChatPageContent />
    </Suspense>
  )
}
