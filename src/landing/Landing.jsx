import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logo from '../assets/logo.png'
import './Landing.css'

const features = [
  {
    icon: 'Bell',
    title: 'Smart Reminders',
    desc: 'Automated rent due alerts and payment reminders via SMS, email, and in-app notifications.',
  },
  {
    icon: 'Shield',
    title: 'Secure Records',
    desc: 'All tenant agreements, payment history, and documents encrypted and stored in one safe place.',
  },
  {
    icon: 'Smartphone',
    title: 'Mobile Ready',
    desc: 'Fully responsive interface that works seamlessly on any device — phone, tablet, or desktop.',
  },
  {
    icon: 'BarChart3',
    title: 'Insights & Reports',
    desc: 'Track income, occupancy rates, and generate data-driven reports with a single click.',
  },
  {
    icon: 'RefreshCw',
    title: 'Real-time Sync',
    desc: 'Instant updates across all devices powered by Supabase real-time engine.',
  },
  {
    icon: 'Zap',
    title: 'Lightning Fast',
    desc: 'Optimized performance with React 19 and modern build tooling for zero-lag experience.',
  },
]

const steps = [
  { num: '01', title: 'Sign Up Free', desc: 'Create your account in under 30 seconds. No credit card required.' },
  { num: '02', title: 'Add Your Rentals', desc: 'List properties, rooms, or items — add tenants, set terms, and track payments.' },
  { num: '03', title: 'Sit Back & Relax', desc: 'Automated reminders, real-time sync, and powerful reports keep you in control.' },
]

const testimonials = [
  { quote: 'Rent Jaga saved me hours of manual tracking. The reminders alone are worth it.', name: 'Rahul S.', role: 'Property Manager' },
  { quote: 'I rent out camera gear and this app handles everything — payments, returns, tenant history.', name: 'Priya M.', role: 'Freelance Photographer' },
  { quote: 'The simplest rental management tool I have ever used. My tenants love the payment reminders.', name: 'Amit K.', role: 'Landlord' },
]

const faqs = [
  { q: 'Is Rent Jaga really free to start?', a: 'Yes! You get a full 30-day free trial with access to all features. No credit card needed.' },
  { q: 'What types of rentals can I manage?', a: 'Places (apartments, houses), rooms (hostel, PG), and things (equipment, vehicles, anything you rent out).' },
  { q: 'Can my tenants use Rent Jaga too?', a: 'Tenants receive payment reminders and can view their payment history through shared links.' },
  { q: 'How is my data protected?', a: 'All data is encrypted in transit and at rest. We use Supabase with row-level security for maximum privacy.' },
  { q: 'Can I cancel anytime?', a: 'Absolutely. No contracts, no cancellation fees. You keep your data forever.' },
]

const socialLinks = [
  { label: 'Twitter', path: 'M4 4l11.733 16h4.267l-11.733 -16zM4 20l6.768 -6.768m2.46 -2.46L20 4' },
  { label: 'GitHub', path: 'M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22' },
  { label: 'LinkedIn', path: 'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM4 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z' },
]

function Icon({ name, size = 20 }) {
  const paths = {
    Bell: 'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0',
    Shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
    Smartphone: 'M12 18h.01M7 21h10a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2z',
    BarChart3: 'M4 20h16M6 16v-4m6 4v-8m6 8v-6',
    RefreshCw: 'M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15',
    Zap: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
    ArrowRight: 'M5 12h14M12 5l7 7-7 7',
    Check: 'M20 6L9 17l-5-5',
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={paths[name] || paths.Zap} />
    </svg>
  )
}

function FAQItem({ question, answer, isOpen, toggle }) {
  return (
    <div className={`faq-item ${isOpen ? 'faq-item--open' : ''}`}>
      <button className="faq-question" onClick={toggle}>
        <span>{question}</span>
        <span className="faq-icon">{isOpen ? '−' : '+'}</span>
      </button>
      <div className="faq-answer" style={{ maxHeight: isOpen ? '200px' : '0' }}>
        <p>{answer}</p>
      </div>
    </div>
  )
}

export default function Landing() {
  const navigate = useNavigate()
  const [openFaq, setOpenFaq] = useState(null)

  return (
    <div className="landing">
      {/* ── Header ── */}
      <header className="l-header">
        <div className="l-container l-header-inner">
          <Link to="/" className="l-logo">
            <img src={logo} alt="Rent Jaga" className="l-logo-img" />
            <span className="l-logo-text">Rent<span className="l-logo-accent">Jaga</span></span>
          </Link>
          <nav className="l-nav">
            <a href="#features" className="l-nav-link">Features</a>
            <a href="#how-it-works" className="l-nav-link">How It Works</a>
            <a href="#pricing" className="l-nav-link">Pricing</a>
            <a href="#faq" className="l-nav-link">FAQ</a>
          </nav>
          <div className="l-header-actions">
            <button className="l-btn-outline" onClick={() => navigate('/login')}>Log in</button>
            <button className="l-btn-primary l-btn-sm" onClick={() => navigate('/signup')}>Sign up</button>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="l-hero">
        <div className="l-hero-glow" />
        <div className="l-hero-glow-2" />
        <div className="l-container l-hero-content">
          <div className="l-hero-badge">
            <Icon name="Zap" size={14} />
            <span>Smart rental management</span>
          </div>
          <h1 className="l-hero-title">
            Rent <span className="l-gradient-text">Jaga</span>
          </h1>
          <p className="l-hero-subtitle">
            One platform to manage rentals of all kinds — places, rooms, and things.
            Track payments, manage tenants, and stay on top of your rental business.
          </p>
          <div className="l-hero-actions">
            <button className="l-btn-primary l-btn-lg" onClick={() => navigate('/signup')}>
              Get started free
              <Icon name="ArrowRight" size={18} />
            </button>
            <a href="#features" className="l-btn-secondary l-btn-lg">Learn more</a>
          </div>
          <div className="l-hero-stats">
            <div className="l-stat">
              <span className="l-stat-value">3</span>
              <span className="l-stat-label">Rental types</span>
            </div>
            <div className="l-stat-divider" />
            <div className="l-stat">
              <span className="l-stat-value">100%</span>
              <span className="l-stat-label">Free to start</span>
            </div>
            <div className="l-stat-divider" />
            <div className="l-stat">
              <span className="l-stat-value">24/7</span>
              <span className="l-stat-label">Tracking</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="l-section">
        <div className="l-container">
          <div className="l-section-header">
            <span className="l-tag">Features</span>
            <h2 className="l-section-title">
              Everything you need to <span className="l-gradient-text">manage rentals</span>
            </h2>
            <p className="l-section-desc">
              Powerful tools designed for landlords, property managers, and anyone renting out their belongings.
            </p>
          </div>
          <div className="l-features-grid">
            {features.map((f) => (
              <div key={f.title} className="l-feature-card">
                <div className="l-feature-accent" />
                <div className="l-feature-body">
                  <div className="l-feature-icon">
                    <Icon name={f.icon} size={20} />
                  </div>
                  <h3 className="l-feature-title">{f.title}</h3>
                  <p className="l-feature-desc">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="l-section l-section--alt">
        <div className="l-container">
          <div className="l-section-header">
            <span className="l-tag">How It Works</span>
            <h2 className="l-section-title">
              Get started in <span className="l-gradient-text">3 simple steps</span>
            </h2>
            <p className="l-section-desc">
              From signup to your first rental managed — it takes less than 5 minutes.
            </p>
          </div>
          <div className="l-steps">
            {steps.map((s) => (
              <div key={s.num} className="l-step">
                <div className="l-step-number">{s.num}</div>
                <h3 className="l-step-title">{s.title}</h3>
                <p className="l-step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="l-section">
        <div className="l-container">
          <div className="l-section-header">
            <span className="l-tag">Testimonials</span>
            <h2 className="l-section-title">
              Loved by <span className="l-gradient-text">rental managers</span>
            </h2>
            <p className="l-section-desc">
              Hear from people who simplified their rental management with Rent Jaga.
            </p>
          </div>
          <div className="l-testimonials">
            {testimonials.map((t) => (
              <div key={t.name} className="l-testimonial-card">
                <div className="l-testimonial-stars">
                  {'★★★★★'}
                </div>
                <p className="l-testimonial-quote">"{t.quote}"</p>
                <div className="l-testimonial-author">
                  <div className="l-testimonial-avatar">{t.name.charAt(0)}</div>
                  <div>
                    <div className="l-testimonial-name">{t.name}</div>
                    <div className="l-testimonial-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="l-section l-section--alt">
        <div className="l-container">
          <div className="l-section-header">
            <span className="l-tag">Pricing</span>
            <h2 className="l-section-title">
              Simple, <span className="l-gradient-text">pay-as-you-go</span> pricing
            </h2>
            <p className="l-section-desc">
              One straightforward plan for everyone. No surprises.
            </p>
          </div>
          <div className="l-pricing-card">
            <div className="l-pricing-badge">Free for 30 days</div>
            <h3 className="l-pricing-heading">Try Rent Jaga free for 30 days</h3>
            <p className="l-pricing-desc">
              After your trial, just <strong>₹5 per head/renter</strong> per month.
              No contracts, no hidden fees. Cancel anytime.
            </p>
            <div className="l-pricing-features">
              {['30-day free trial — full access', '₹5/renter per month after trial', 'No contracts, cancel anytime', 'All features included'].map((item) => (
                <div key={item} className="l-pricing-feature">
                  <Icon name="Check" size={16} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <button className="l-btn-primary l-btn-lg" onClick={() => navigate('/signup')}>
              Start your free trial
              <Icon name="ArrowRight" size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="l-section">
        <div className="l-container">
          <div className="l-section-header">
            <span className="l-tag">FAQ</span>
            <h2 className="l-section-title">
              Got <span className="l-gradient-text">questions?</span>
            </h2>
            <p className="l-section-desc">
              Everything you need to know about Rent Jaga.
            </p>
          </div>
          <div className="l-faq">
            {faqs.map((faq, i) => (
              <FAQItem
                key={i}
                question={faq.q}
                answer={faq.a}
                isOpen={openFaq === i}
                toggle={() => setOpenFaq(openFaq === i ? null : i)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="l-section l-cta">
        <div className="l-container">
          <div className="l-cta-card">
            <h2 className="l-cta-title">Ready to simplify your rental management?</h2>
            <p className="l-cta-desc">Join thousands of happy users. Start your free 30-day trial today.</p>
            <button className="l-btn-primary l-btn-lg" onClick={() => navigate('/signup')}>
              Get started free
              <Icon name="ArrowRight" size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="l-footer">
        <div className="l-container l-footer-inner">
          <div className="l-footer-brand">
            <Link to="/" className="l-logo">
              <img src={logo} alt="Rent Jaga" className="l-logo-img" />
              <span className="l-logo-text">Rent<span className="l-logo-accent">Jaga</span></span>
            </Link>
            <p className="l-footer-desc">Smart rental management for places, rooms, and things.</p>
            <div className="l-footer-social">
              {socialLinks.map((s) => (
                <a key={s.label} href="#" className="l-social-link" aria-label={s.label}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={s.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>
          <div className="l-footer-links">
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'FAQ', 'Integrations'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
              { title: 'Support', links: ['Help Center', 'Privacy', 'Terms', 'Status'] },
            ].map((col) => (
              <div key={col.title} className="l-footer-col">
                <h5>{col.title}</h5>
                {col.links.map((link) => (
                  <a key={link} href="#">{link}</a>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="l-footer-bottom">
          <div className="l-container">
            <p>&copy; {new Date().getFullYear()} Rent Jaga. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
