import { Link, useNavigate } from 'react-router-dom'
import './Landing.css'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="landing">
      <header className="l-header">
        <div className="l-container l-header-inner">
          <Link to="/" className="l-logo">
            <span className="l-logo-text">makeNuse</span>
          </Link>
          <nav className="l-nav">
            <a href="#features" className="l-nav-link">Features</a>
            <a href="#pricing" className="l-nav-link">Pricing</a>
          </nav>
          <div className="l-header-actions">
            <button className="l-btn-outline" onClick={() => navigate('/login')}>Log in</button>
            <button className="l-btn-primary l-btn-sm" onClick={() => navigate('/signup')}>Sign up</button>
          </div>
        </div>
      </header>

      <section className="l-hero">
        <div className="l-container l-hero-content">
          <h1 className="l-hero-title">Welcome to <span className="l-gradient-text">makeNuse</span></h1>
          <p className="l-hero-subtitle">
            Build something great. A clean starter with authentication, theming, and a modern stack ready to go.
          </p>
          <div className="l-hero-actions">
            <button className="l-btn-primary l-btn-lg" onClick={() => navigate('/signup')}>
              Get started
            </button>
            <a href="#features" className="l-btn-secondary l-btn-lg">Learn more</a>
          </div>
        </div>
      </section>

      <section id="features" className="l-section">
        <div className="l-container">
          <div className="l-section-header">
            <span className="l-tag">Features</span>
            <h2 className="l-section-title">Everything you need to <span className="l-gradient-text">get started</span></h2>
          </div>
          <div className="l-features-grid">
            <div className="l-feature-card">
              <h3>Auth Ready</h3>
              <p>Email, phone OTP, and Google login built-in with Supabase. Session handling included.</p>
            </div>
            <div className="l-feature-card">
              <h3>Dark Mode</h3>
              <p>Light and dark theme with persistent toggle. Easy to customize.</p>
            </div>
            <div className="l-feature-card">
              <h3>Profile Page</h3>
              <p>User profile with account details, connected services, and theme settings out of the box.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="l-section l-section--alt">
        <div className="l-container">
          <div className="l-section-header">
            <span className="l-tag">Pricing</span>
            <h2 className="l-section-title">Simple, <span className="l-gradient-text">transparent</span> pricing</h2>
          </div>
          <div className="l-pricing-card">
            <h3 className="l-pricing-heading">Free to start</h3>
            <p className="l-pricing-desc">No credit card required. All features included.</p>
            <button className="l-btn-primary l-btn-lg" onClick={() => navigate('/signup')}>Get started</button>
          </div>
        </div>
      </section>

      <footer className="l-footer">
        <div className="l-container l-footer-inner">
          <div className="l-footer-brand">
            <span className="l-logo-text">makeNuse</span>
            <p className="l-footer-desc">A modern starter for your next project.</p>
          </div>
        </div>
        <div className="l-footer-bottom">
          <div className="l-container">
            <p>&copy; {new Date().getFullYear()} makeNuse. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
