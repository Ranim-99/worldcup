// components/Navbar.jsx
import React, { useState, useEffect } from 'react'
import { navItems } from '../constants/nav-items'

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const currentPath = '/' // Mock current path

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && !event.target.closest('.navbar')) {
        setIsMobileMenuOpen(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [isMobileMenuOpen])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <>
      <header className="navbar">
        <div className="navbar__container">
          {/* logo */}
          <div className="navbar__logo">
            <a href="/">
              <img src="/ahw.png" alt="Arabhardware Logo" />
              <span>Arabhardware</span>
            </a>
          </div>

          {/* Desktop nav links */}
          <nav className="navbar__nav navbar__nav--desktop">
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

          {/* Mobile menu button */}
          <button 
            className="navbar__mobile-toggle"
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            <span className={`navbar__hamburger ${isMobileMenuOpen ? 'navbar__hamburger--active' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
        </div>
      </header>

      {/* Mobile menu overlay */}
      <div className={`navbar__mobile-overlay ${isMobileMenuOpen ? 'navbar__mobile-overlay--active' : ''}`}>
        <div className={`navbar__mobile-menu ${isMobileMenuOpen ? 'navbar__mobile-menu--active' : ''}`}>
          {/* Mobile menu header */}
          <div className="navbar__mobile-header">
            <div className="navbar__logo">
              <a href="/" onClick={closeMobileMenu}>
                <img src="/ahw.png" alt="Arabhardware Logo" />
                <span>Arabhardware</span>
              </a>
            </div>
            <button 
              className="navbar__mobile-close"
              onClick={closeMobileMenu}
              aria-label="Close mobile menu"
            >
              ✕
            </button>
          </div>

          {/* Mobile nav links */}
          <nav className="navbar__mobile-nav">
            {navItems.map(({ title, href }) => {
              const isActive = currentPath === href
              return (
                <a
                  key={href}
                  href={href}
                  className={
                    'navbar__mobile-link' +
                    (isActive ? ' navbar__mobile-link--active' : '')
                  }
                  onClick={closeMobileMenu}
                >
                  {title}
                </a>
              )
            })}
          </nav>
        </div>
      </div>
    </>
  )
}