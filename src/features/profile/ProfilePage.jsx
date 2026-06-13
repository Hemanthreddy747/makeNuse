import { LogOut, Sun, Moon, Trash2, Mail, Shield, Clock, User as UserIcon } from 'lucide-react'
import { useAuth } from '../../context/AuthProvider'
import { useTheme } from '../../context/ThemeContext'
import { formatDate, formatDateTime } from '../../lib/dates'
import { supabase } from '../../lib/supabaseClient'
import { useConfirm } from '../../context/ConfirmContext'

export default function ProfilePage() {
  const { user, signInWithGoogle, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const confirm = useConfirm()

  const displayName = user.user_metadata?.full_name || user.user_metadata?.name || user.email
  const avatarUrl = user.user_metadata?.avatar_url
  const provider = user.app_metadata?.provider || 'email'
  const memberSince = formatDate(user.created_at)
  const lastSignIn = user.last_sign_in_at ? formatDateTime(user.last_sign_in_at) : '—'

  return (
    <div className="page-profile">
      {/* <div className="page-header">
        <h1>Profile</h1>
        <p className="page-subtitle">Manage your account and preferences</p>
      </div> */}

      <div className="profile-layout">
        <div className="profile-sidebar">
          <div className="profile-card">
            <div className="profile-avatar-section">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="profile-avatar" />
              ) : (
                <div className="profile-avatar profile-avatar--initials">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <h2>{displayName}</h2>
              <span className="profile-badge">{provider === 'email' ? 'Email' : provider}</span>
            </div>

            <div className="profile-meta">
              <div className="profile-meta-item">
                <Mail size={14} />
                <span>{user.email}</span>
              </div>
              <div className="profile-meta-item">
                <Clock size={14} />
                <span>Joined {memberSince}</span>
              </div>
              <div className="profile-meta-item">
                <Shield size={14} />
                <span>{user.email_confirmed_at ? 'Email verified' : 'Email not verified'}</span>
              </div>
            </div>

            <button className="btn-logout" onClick={signOut}>
              <LogOut size={16} />
              <span>Sign out</span>
            </button>
          </div>

          <div className="profile-card">
            <h3>Appearance</h3>
            <div className="theme-toggle-row" onClick={toggleTheme}>
              <div className="theme-toggle-info">
                {theme === 'light' ? <Sun size={16} /> : <Moon size={16} />}
                <span>{theme === 'light' ? 'Light mode' : 'Dark mode'}</span>
              </div>
              <div className={`theme-switch${theme === 'dark' ? ' active' : ''}`}>
                <div className="theme-switch-knob" />
              </div>
            </div>
          </div>

          <div className="profile-card profile-card--danger">
            <h3>Danger zone</h3>
            <button className="btn-danger" onClick={async () => {
              const ok = await confirm('Delete ALL your data? This includes properties, rooms, persons, rent records, and documents. This cannot be undone.')
              if (!ok) return
              const ok2 = await confirm('Final warning. All data will be permanently deleted. Continue?')
              if (!ok2) return
              await supabase.rpc('clear_user_data')
              window.location.reload()
            }}>
              <Trash2 size={16} />
              <span>Clear all data</span>
            </button>
          </div>
        </div>

        <div className="profile-main">
          <div className="profile-card">
            <h3>Account details</h3>
            <div className="profile-table">
              <div className="profile-table-row">
                <span className="profile-table-label">User ID</span>
                <span className="profile-table-value code">{user.id}</span>
              </div>
              <div className="profile-table-row">
                <span className="profile-table-label">Email</span>
                <span className="profile-table-value">{user.email}</span>
              </div>
              <div className="profile-table-row">
                <span className="profile-table-label"> Verified</span>
                <span className="profile-table-value">{user.email_confirmed_at ? 'Yes' : 'No'}</span>
              </div>
              <div className="profile-table-row">
                <span className="profile-table-label">Provider</span>
                <span className="profile-table-value">{provider}</span>
              </div>
              <div className="profile-table-row">
                <span className="profile-table-label">Last sign in</span>
                <span className="profile-table-value">{lastSignIn}</span>
              </div>
              <div className="profile-table-row">
                <span className="profile-table-label">Member since</span>
                <span className="profile-table-value">{memberSince}</span>
              </div>
            </div>
          </div>

          <div className="profile-card">
            <h3>Connected services</h3>
            <div className="profile-services">
              <div className="profile-service">
                <div className="profile-service-info">
                  <UserIcon size={16} />
                  <div>
                    <strong>Google</strong>
                    <span>{provider === 'google' ? 'Connected' : 'Not connected'}</span>
                  </div>
                </div>
                {provider !== 'google' && (
                  <button className="btn-connect" onClick={signInWithGoogle}>Connect</button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
