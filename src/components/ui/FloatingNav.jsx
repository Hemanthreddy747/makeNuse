import { useState, useRef, useEffect } from "react"
import { useNavigate, useLocation, Link } from "react-router-dom"
import { motion } from "motion/react"
import { Settings, FileText, Layers, Bot } from "lucide-react"
import logo from "../../assets/logo.png"

const navItems = [
  { id: 0, to: "/make", icon: Bot, label: "Make" },
  { id: 1, to: "/page1", icon: FileText, label: "Page 1" },
  { id: 2, to: "/page2", icon: Layers, label: "Page 2" },
  { id: 3, to: "/profile", icon: Settings, label: "Profile" },
]

const staticPaths = {
  "/make": 0,
  "/page1": 1,
  "/page2": 2,
  "/profile": 3,
}

function resolveActive(pathname) {
  if (pathname in staticPaths) return staticPaths[pathname]
  return -1
}

export default function FloatingNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const [active, setActive] = useState(() => resolveActive(location.pathname))
  const [indicatorStyle, setIndicatorStyle] = useState({ width: 0, left: 0 })
  const containerRef = useRef(null)
  const btnRefs = useRef([])

  useEffect(() => {
    const id = resolveActive(location.pathname)
    setActive(id)
  }, [location.pathname])

  useEffect(() => {
    const updateIndicator = () => {
      const btn = btnRefs.current[active]
      const container = containerRef.current
      if (!btn || !container) return
      const btnRect = btn.getBoundingClientRect()
      const containerRect = container.getBoundingClientRect()
      setIndicatorStyle({
        width: btnRect.width,
        left: btnRect.left - containerRect.left,
      })
    }
    updateIndicator()
    window.addEventListener("resize", updateIndicator)
    return () => window.removeEventListener("resize", updateIndicator)
  }, [active])

  const handleClick = (to) => {
    navigate(to)
  }

  return (
    <div className="floating-nav-wrapper">
      <div ref={containerRef} className="floating-nav-pill">
        <Link to="/profile" className="floating-nav-logo">
          <img src={logo} alt="makeNuse" />
        </Link>

        {navItems.map((item, index) => (
          <button
            key={item.id}
            ref={(el) => (btnRefs.current[index] = el)}
            onClick={() => handleClick(item.to)}
            className={`floating-nav-btn${active === index ? " active" : ""}`}
          >
            <item.icon size={22} />
            <span className="floating-nav-label">{item.label}</span>
          </button>
        ))}

        <motion.div
          className="floating-nav-indicator"
          animate={indicatorStyle}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      </div>
    </div>
  )
}
