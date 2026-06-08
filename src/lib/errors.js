import { toast } from 'react-toastify'

/**
 * Extract a readable error message from various error shapes.
 * @param {unknown} error
 * @returns {string}
 */
export function getErrorMessage(error) {
  if (!error) return 'An unexpected error occurred'

  if (typeof error === 'string') return error

  if (error instanceof Error) return error.message

  if (error.message) return error.message

  if (error.error_description) return error.error_description

  if (error.error) return typeof error.error === 'string' ? error.error : 'An unexpected error occurred'

  return 'An unexpected error occurred'
}

/**
 * Known Supabase auth error messages mapped to user-friendly text.
 */
const AUTH_ERROR_MESSAGES = {
  'Invalid login credentials': 'Invalid email or password',
  'Email not confirmed': 'Please confirm your email before logging in',
  'User already registered': 'An account with this email already exists',
  'Too many requests': 'Too many requests. Please wait before trying again',
  'OTP has expired': 'OTP has expired. Request a new one',
  'Invalid OTP': 'Invalid OTP. Please try again',
  'Password should be at least 6 characters': 'Password must be at least 6 characters',
  'New password should be different from the old password': 'New password must be different from your current password',
}

/**
 * Handle an auth error with a user-friendly toast message.
 * @param {unknown} error
 */
export function handleAuthError(error) {
  const message = getErrorMessage(error)

  for (const [key, friendly] of Object.entries(AUTH_ERROR_MESSAGES)) {
    if (message.toLowerCase().includes(key.toLowerCase())) {
      toast.error(friendly)
      return
    }
  }

  toast.error(message)
}

/**
 * Display a success toast.
 * @param {string} message
 */
export function toastSuccess(message) {
  toast.success(message)
}

/**
 * Display an error toast.
 * @param {string} message
 */
export function toastError(message) {
  toast.error(message)
}

/**
 * Validate required form fields and return a map of field errors.
 * @param {object} fields - { fieldName: value }
 * @param {object} [rules] - { fieldName: { required?, minLength?, maxLength?, pattern?, message } }
 * @returns {object} - { fieldName: errorMessage }
 */
export function validateFields(fields, rules = {}) {
  const errors = {}

  for (const [field, value] of Object.entries(fields)) {
    const rule = rules[field]
    if (!rule) continue

    if (rule.required && !value?.toString().trim()) {
      errors[field] = rule.message || `${field} is required`
      continue
    }

    if (value && rule.minLength && value.toString().length < rule.minLength) {
      errors[field] = rule.message || `Must be at least ${rule.minLength} characters`
      continue
    }

    if (value && rule.maxLength && value.toString().length > rule.maxLength) {
      errors[field] = rule.message || `Must be at most ${rule.maxLength} characters`
      continue
    }

    if (value && rule.pattern && !rule.pattern.test(value.toString())) {
      errors[field] = rule.message || `Invalid ${field} format`
    }
  }

  return errors
}

/**
 * Clear a specific field error. Useful for real-time validation as user types.
 * @param {object} setter - React state setter function (e.g., setFieldErrors)
 * @param {string} field - Field name to clear
 */
export function clearFieldError(setter, field) {
  setter((prev) => {
    if (!prev[field]) return prev
    const next = { ...prev }
    delete next[field]
    return next
  })
}
