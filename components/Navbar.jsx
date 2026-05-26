"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const pathname = usePathname()
  
  const links = [
    { href: '/', label: 'Dashboard' },
    { href: '/upload', label: 'Library' },
    { href: '/chat', label: 'Chat' },
  ]

  // Get active breadcrumb title
  const getPageTitle = () => {
    switch (pathname) {
      case '/': return 'Workspace Dashboard'
      case '/upload': return 'Vector Library'
      case '/chat': return 'AI Chat Session'
      default: return 'Study Buddy'
    }
  }

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-left">
          {/* Logo Icon and Breadcrumb */}
          <div className="nav-logo-box">
            <span className="nav-logo-icon">🎓</span>
            <strong className="nav-title">{getPageTitle()}</strong>
          </div>
        </div>
        
        {/* Navigation links (Visible on mobile/desktop as breadcrumb links) */}
        <ul className="nav-links">
          {links.map(link => {
            const isActive = pathname === link.href
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={isActive ? 'active' : ''}
                >
                  {link.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
