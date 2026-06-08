import { useState } from "react"
import { NavLink, Link } from "react-router-dom"
import { motion, AnimatePresence } from "motion/react"
import { Menu, X, LogOut, User } from "lucide-react"
import { useAuth } from "../../context/AuthProvider"
import { useLoginModal } from "../../context/LoginModalContext"
import logo from "../../assets/logo.png"

export default function Navbar() {
  const { user, signOut } = useAuth()
  const { openLogin, openSignup } = useLoginModal()
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => setIsOpen((prev) => !prev)
  const closeMenu = () => setIsOpen(false)

  const handleLogout = async () => {
    closeMenu()
    await signOut()
  }

  const isAuthenticated = !!user

  const links = isAuthenticated
    ? [
        { to: "/dashboard", label: "Dashboard" },
        { to: "/todo", label: "Todo" },
        { to: "/location", label: "Location" },
        { to: "/settings", label: "Settings" },
      ]
    : [
        { to: "/", label: "Home" },
        { to: "/features", label: "Features" },
      ]

  const userInitial = (
    user?.user_metadata?.full_name || user?.email || "?"
  ).charAt(0).toUpperCase()

  const isHome = (to) => to === "/dashboard" || to === "/"

  return (
    <div className="navbar-wrapper">
      <div className="navbar-pill">
        <div className="navbar-pill-inner">
          <motion.div
            className="navbar-logo"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            whileHover={{ rotate: 5 }}
            transition={{ duration: 0.3 }}
          >
            <Link to="/" className="navbar-brand">
              <img src={logo} alt="Rent Jaga" className="navbar-logo-img" />
            </Link>
          </motion.div>

          <nav className="navbar-desktop-nav">
            {links.map((link) => (
              <motion.div
                key={link.to}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ scale: 1.05 }}
              >
                <NavLink
                  to={link.to}
                  end={isHome(link.to)}
                  className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
                  onClick={closeMenu}
                >
                  {link.label}
                </NavLink>
              </motion.div>
            ))}
          </nav>

          <motion.div
            className="navbar-desktop-actions"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
          >
            {isAuthenticated ? (
              <>
                <NavLink to="/profile" className="navbar-user-btn" onClick={closeMenu}>
                  <span className="navbar-avatar">{userInitial}</span>
                  <span className="navbar-email">{user?.email}</span>
                </NavLink>
                <button
                  type="button"
                  className="navbar-logout-btn"
                  onClick={handleLogout}
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <div className="navbar-public-actions">
                <button onClick={() => { closeMenu(); openLogin() }} className="navbar-login-btn" style={{ background: 'transparent', border: 'none', padding: '6px 18px', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-semibold)', borderRadius: 'var(--radius-pill)', cursor: 'pointer', color: 'var(--color-text)' }}>Log in</button>
                <button onClick={() => { closeMenu(); openSignup() }} className="navbar-signup-btn" style={{ background: 'var(--color-primary)', border: 'none', padding: '6px 18px', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-semibold)', borderRadius: 'var(--radius-pill)', cursor: 'pointer', color: 'var(--color-white)' }}>Sign up</button>
              </div>
            )}
          </motion.div>

          <motion.button
            className="navbar-mobile-toggle"
            onClick={toggleMenu}
            whileTap={{ scale: 0.9 }}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="navbar-mobile-overlay"
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <motion.button
              className="navbar-mobile-close"
              onClick={toggleMenu}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <X size={24} />
            </motion.button>

            <div className="navbar-mobile-links">
              {links.map((item, i) => (
                <motion.div
                  key={item.to}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 + 0.1 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <NavLink
                    to={item.to}
                    end={isHome(item.to)}
                    className={({ isActive }) =>
                      `nav-link nav-link-mobile${isActive ? " active" : ""}`
                    }
                    onClick={closeMenu}
                  >
                    {item.label}
                  </NavLink>
                </motion.div>
              ))}
            </div>

            <motion.div
              className="navbar-mobile-footer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              exit={{ opacity: 0, y: 20 }}
            >
              {isAuthenticated ? (
                <>
                  <NavLink to="/profile" className="navbar-mobile-profile" onClick={closeMenu}>
                    <User size={18} />
                    <span>Profile</span>
                  </NavLink>
                  <button type="button" className="navbar-mobile-logout" onClick={handleLogout}>
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => { closeMenu(); openLogin() }} className="navbar-mobile-login-btn" style={{ background: '#f3f4f6', border: 'none', display: 'block', width: '100%', padding: '14px 20px', fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-semibold)', borderRadius: 'var(--radius-pill)', cursor: 'pointer', color: 'var(--color-text)', textAlign: 'center' }}>Log in</button>
                  <button onClick={() => { closeMenu(); openSignup() }} className="navbar-mobile-signup-btn" style={{ background: 'var(--color-primary)', border: 'none', display: 'block', width: '100%', padding: '14px 20px', fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-semibold)', borderRadius: 'var(--radius-pill)', cursor: 'pointer', color: 'var(--color-white)', textAlign: 'center' }}>Sign up</button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
