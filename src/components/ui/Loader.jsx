export default function Loader({ size = 'md', className = '' }) {
  return (
    <div className={`loader-wrap ${className}`}>
      <div className={`loader loader-${size}`} />
    </div>
  )
}
