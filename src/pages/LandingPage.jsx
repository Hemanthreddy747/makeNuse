import { Link } from 'react-router-dom'
import {
  Bell,
  Shield, Smartphone, BarChart3, RefreshCw,
  ArrowRight, Zap
} from 'lucide-react'
import { useLoginModal } from '../context/LoginModalContext'
import logo from '../assets/logo.png'
import './LandingPage.css'

const features = [
  {
    icon: Bell,
    title: 'Smart Reminders',
    desc: 'Automated rent due alerts and payment reminders across all channels.',
  },
  {
    icon: Shield,
    title: 'Secure Records',
    desc: 'All tenant agreements, payment history, and documents in one safe place.',
  },
  {
    icon: Smartphone,
    title: 'Mobile Ready',
    desc: 'Fully responsive interface that works seamlessly on any device.',
  },
  {
    icon: BarChart3,
    title: 'Insights & Reports',
    desc: 'Track income, occupancy, and generate data-driven reports instantly.',
  },
  {
    icon: RefreshCw,
    title: 'Real-time Sync',
    desc: 'Instant updates across all devices with Supabase real-time engine.',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    desc: 'Optimized performance with React 19 and modern build tooling.',
  },
]

export default function LandingPage() {
  const { openLogin, openSignup } = useLoginModal()
  return (
    <div className="landing-page">
      {/* ── Header ──────────────────────── */}
      <header className="landing-header">
        <div className="landing-header-inner">
          <Link to="/" className="landing-brand">
            <img src={logo} alt="Rent Jaga" className="landing-brand-logo" />
          </Link>
          <nav className="landing-nav">
            <Link to="/" className="landing-nav-link active">Home</Link>
            <a href="#features" className="landing-nav-link">Features</a>
            <a href="#pricing" className="landing-nav-link">Pricing</a>
          </nav>
          <div className="landing-header-actions">
            <button onClick={openLogin} className="landing-btn-outline" style={{ padding: '8px 20px', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-semibold)', borderRadius: 'var(--radius-pill)', cursor: 'pointer' }}>Log in</button>
            <button onClick={openSignup} className="landing-btn-solid" style={{ padding: '8px 20px', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-semibold)', borderRadius: 'var(--radius-pill)', cursor: 'pointer', border: 'none', color: 'var(--color-white)', background: 'var(--color-primary)' }}>Sign up</button>
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────── */}
      <section className="landing-hero">
        <div className="landing-hero-pattern" />
        <div className="landing-hero-glow" />
        <div className="landing-hero-glow-2" />
        <div className="landing-hero-content">
          <div className="landing-hero-badge">
            <Zap size={14} />
            <span>Smart rental management</span>
          </div>
          <h1 className="landing-hero-title">
            Rent <span className="landing-hero-highlight">Jaga</span>
          </h1>
          <p className="landing-hero-subtitle">
            One platform to manage rentals of all kinds — places, rooms, and things.
            Track payments, manage tenants, and stay on top of your rental business.
          </p>
          <div className="landing-hero-actions">
            <button onClick={openSignup} className="landing-btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--spacing-2)', padding: '0.9rem 2.2rem', fontSize: 'var(--font-size-md)', fontWeight: 'var(--font-semibold)', border: 'none', borderRadius: 'var(--radius-lg)', background: 'var(--color-primary)', color: 'var(--color-white)', cursor: 'pointer', boxShadow: '0 4px 14px rgba(124, 58, 237, 0.3)' }}>
              Get started free
              <ArrowRight size={18} />
            </button>
            <a href="#features" className="landing-btn-secondary">
              Learn more
            </a>
          </div>
          <div className="landing-hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-value">3</span>
              <span className="hero-stat-label">Rental types</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-value">100%</span>
              <span className="hero-stat-label">Free to start</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-value">24/7</span>
              <span className="hero-stat-label">Tracking</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────── */}
      <section id="features" className="landing-section landing-features">
        <div className="landing-section-inner">
          <div className="landing-section-header">
            <span className="landing-section-tag">Features</span>
            <h2 className="landing-section-title">
              Everything you need to <span className="text-highlight">manage rentals</span>
            </h2>
            <p className="landing-section-desc">
              Powerful tools designed for landlords, property managers, and anyone
              renting out their belongings.
            </p>
          </div>
          <div className="features-grid">
            {features.map((f, i) => (
              <div key={f.title} className={`feature-card ${i === 0 ? 'feature-card--wide' : ''}`}>
                <div className="feature-card-accent" />
                <div className="feature-card-body">
                  <div className="feature-icon-wrap">
                    <f.icon size={20} />
                  </div>
                  <h3 className="feature-title">{f.title}</h3>
                  <p className="feature-desc">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────── */}
      <section id="pricing" className="landing-section landing-pricing">
        <div className="landing-section-inner">
          <div className="landing-section-header">
            <span className="landing-section-tag">Pricing</span>
            <h2 className="landing-section-title">
              Simple, <span className="text-highlight">pay-as-you-go</span> pricing
            </h2>
            <p className="landing-section-desc">
              One straightforward plan for everyone.
            </p>
          </div>
          <div className="pricing-simple-card">
            <div className="pricing-simple-badge">Free for 30 days</div>
            <h3 className="pricing-simple-heading">
              Try Rent Jaga free for 30 days
            </h3>
            <p className="pricing-simple-desc">
              After your trial, just <strong>₹5 per head/renter</strong> per month.
              No contracts, no hidden fees. Cancel anytime.
            </p>
            <div className="pricing-simple-features">
              <div className="pricing-simple-feature">
                <Zap size={16} />
                <span>30-day free trial — full access</span>
              </div>
              <div className="pricing-simple-feature">
                <Zap size={16} />
                <span>₹5/renter per month after trial</span>
              </div>
              <div className="pricing-simple-feature">
                <Zap size={16} />
                <span>No contracts, cancel anytime</span>
              </div>
            </div>
            <button onClick={openSignup} className="pricing-simple-btn">
              Start your free trial <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────── */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="landing-footer-brand">
            <Link to="/" className="landing-brand">
              <img src={logo} alt="Rent Jaga" className="landing-brand-logo" />
            </Link>
            <p className="landing-footer-desc">
              Smart rental management for places, rooms, and things.
            </p>
            <div className="landing-footer-social">
              <a href="#" className="landing-footer-social-link" aria-label="Twitter">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l11.733 16h4.267l-11.733 -16z" /><path d="M4 20l6.768 -6.768m2.46 -2.46L20 4" /></svg>
              </a>
              <a href="#" className="landing-footer-social-link" aria-label="GitHub">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" /></svg>
              </a>
              <a href="#" className="landing-footer-social-link" aria-label="LinkedIn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>
              </a>
            </div>
          </div>
          <div className="landing-footer-links">
            <div className="landing-footer-col">
              <h5>Product</h5>
              <a href="#features">Features</a>
              <a href="#pricing">Pricing</a>
              <Link to="/">FAQ</Link>
            </div>
            <div className="landing-footer-col">
              <h5>Company</h5>
              <Link to="/">About</Link>
              <Link to="/">Blog</Link>
              <Link to="/">Careers</Link>
              <Link to="/">Contact</Link>
            </div>
            <div className="landing-footer-col">
              <h5>Support</h5>
              <Link to="/">Help center</Link>
              <Link to="/">Privacy</Link>
              <Link to="/">Terms</Link>
              <Link to="/">Status</Link>
            </div>

          </div>
        </div>
        <div className="landing-footer-bottom">
          <p>&copy; {new Date().getFullYear()} Rent Jaga. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
