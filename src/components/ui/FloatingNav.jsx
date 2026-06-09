import { useState, useRef, useEffect } from "react"
import { useNavigate, useLocation, Link } from "react-router-dom"
import { motion } from "motion/react"
import { LayoutDashboard, Plus, List, Settings } from "lucide-react"
import logo from "../../assets/logo.png"

const navItems = [
  { id: 0, to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { id: 1, to: "/add-new", icon: Plus, label: "Add New" },
  { id: 2, to: "/manage", icon: List, label: "Manage" },
  { id: 3, to: "/profile", icon: Settings, label: "Profile" },
]

const pathToId = {
  "/dashboard": 0,
  "/add-new": 1,
  "/manage": 2,
  "/profile": 3,
}

export default function FloatingNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const [active, setActive] = useState(() => pathToId[location.pathname] ?? 0)
  const [indicatorStyle, setIndicatorStyle] = useState({ width: 0, left: 0 })
  const containerRef = useRef(null)
  const btnRefs = useRef([])

  useEffect(() => {
    const id = pathToId[location.pathname]
    if (id !== undefined) setActive(id)
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
        <Link to="/dashboard" className="floating-nav-logo">
          <img src={logo} alt="Rent Jaga" />
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
