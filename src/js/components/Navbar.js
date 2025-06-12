// components/Navbar.jsx
import React from 'react'
import { navItems } from '../constants/nav-items'

export default function Navbar() {
  const currentPath = window.location.pathname

  return (
    <header className="navbar">
      <div className="navbar__container">
        {/* logo */}
        <div className="navbar__logo">
          <a href="/">
            <img src="/ahw.png" alt="Arabhardware Logo" />
          </a>
        </div>

        {/* nav links */}
        <nav className="navbar__nav">
          {navItems.map(({ title, href }) => {
            const isActive = currentPath === href
            return (
              <a
                key={href}
                href={href}
                className={
                  'navbar__link' +
                  (isActive ? ' navbar__link--active' : '')
                }
              >
                {title}
              </a>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
