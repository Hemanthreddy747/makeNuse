/**
 * Format a date string/object to a readable date string.
 * @param {string|Date} date - ISO string or Date object
 * @param {object} [options] - Intl.DateTimeFormat options
 * @returns {string} Formatted date
 */
export function formatDate(date, options = {}) {
  const d = date instanceof Date ? date : new Date(date)
  if (isNaN(d.getTime())) return '—'

  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...options,
  })
}

/**
 * Format a date with time.
 * @param {string|Date} date
 * @param {object} [options]
 * @returns {string}
 */
export function formatDateTime(date, options = {}) {
  const d = date instanceof Date ? date : new Date(date)
  if (isNaN(d.getTime())) return '—'

  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  })
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
  return formatDate(date, { year: 'numeric', month: 'long', day: 'numeric' })
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
