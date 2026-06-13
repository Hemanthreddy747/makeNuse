function pad(n) {
  return String(n).padStart(2, '0')
}

/**
 * Format a date string/object to dd-mm-yyyy.
 * @param {string|Date} date - ISO string or Date object
 * @returns {string} Formatted date
 */
export function formatDate(date) {
  const d = date instanceof Date ? date : new Date(date)
  if (isNaN(d.getTime())) return '—'

  return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`
}

/**
 * Format a date with time to dd-mm-yyyy, HH:MM AM/PM.
 * @param {string|Date} date
 * @returns {string}
 */
export function formatDateTime(date) {
  const d = date instanceof Date ? date : new Date(date)
  if (isNaN(d.getTime())) return '—'

  const datePart = `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`
  if (typeof date === 'string' && !date.includes('T')) return datePart
  const timePart = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  return `${datePart}, ${timePart}`
}

/**
 * Format a time string (hours:minutes:seconds).
 * @param {string|Date} date
 * @param {object} [options]
 * @returns {string}
 */
export function formatTime(date, options = {}) {
  const d = date instanceof Date ? date : new Date(date)
  if (isNaN(d.getTime())) return '—'

  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    ...options,
  })
}

/**
 * Format a date as relative time (e.g. "2 hours ago", "just now").
 * @param {string|Date} date
 * @returns {string}
 */
export function formatRelative(date) {
  const d = date instanceof Date ? date : new Date(date)
  if (isNaN(d.getTime())) return '—'

  const now = new Date()
  const diffMs = now - d
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHr = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr / 24)

  if (diffSec < 10) return 'just now'
  if (diffSec < 60) return `${diffSec}s ago`
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr < 24) return `${diffHr}h ago`
  if (diffDay < 7) return `${diffDay}d ago`
  return formatDate(d)
}

/**
 * Get a "member since" label.
 * @param {string|Date} date - account creation date
 * @returns {string}
 */
export function memberSince(date) {
  const d = date instanceof Date ? date : new Date(date)
  if (isNaN(d.getTime())) return '—'
  return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`
}

/**
 * Check if a date string is valid.
 * @param {string} dateString
 * @returns {boolean}
 */
export function isValidDate(dateString) {
  if (!dateString) return false
  const d = new Date(dateString)
  return !isNaN(d.getTime())
}
