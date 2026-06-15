export default function FieldAlert({ type, message }) {
  if (!message) return null
  return <span className={`field-alert field-alert--${type}`}>{message}</span>
}
