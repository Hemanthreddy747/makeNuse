import { useAuth } from '../../context/AuthProvider'

export default function DashboardPage() {
  const { user } = useAuth()

  const displayName = user.user_metadata?.full_name || user.user_metadata?.name || user.email

  return (
    <div className="page-dashboard">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p className="page-subtitle">Welcome back, {displayName}</p>
      </div>

      <div className="dashboard-cards">
        <div className="dash-card">
          <h2>Quick Actions</h2>
          <div className="quick-actions">
            <a href="/add-new" className="quick-action">
              <span className="qa-icon">+</span>
              <span>Add New</span>
            </a>
            <a href="/manage" className="quick-action">
              <span className="qa-icon">&#x2630;</span>
              <span>Manage</span>
            </a>
            <a href="/profile" className="quick-action">
              <span className="qa-icon">@</span>
              <span>Profile</span>
            </a>
          </div>
        </div>

        <div className="dash-card">
          <h2>Account</h2>
          <div className="dash-account-info">
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Member since:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
            {user.last_sign_in_at && (
              <p><strong>Last sign in:</strong> {new Date(user.last_sign_in_at).toLocaleDateString()}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
