import '../styles/globals.css'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { Suspense } from 'react'

export const metadata = {
  title: 'StudyAI — AI-Powered Study Assistant',
  description: 'Upload your study materials and chat with AI to get instant answers, explanations, and insights.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Suspense fallback={null}>
          <Navbar />
        </Suspense>
        <div className="app-grid">
          <Suspense fallback={<div className="muted" style={{ padding: '24px' }}>Loading menu...</div>}>
            <Sidebar />
          </Suspense>
          <main className="main-content">{children}</main>
        </div>
      </body>
    </html>
  )
}
