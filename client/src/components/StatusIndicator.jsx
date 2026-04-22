export default function StatusIndicator({ status, size = 'sm' }) {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  const statusClasses = {
    online: 'status-online',
    away: 'status-away',
    dnd: 'status-dnd',
    offline: 'status-offline'
  }

  return (
    <div className={`${sizeClasses[size]} ${statusClasses[status]} rounded-full border-2 border-bg-sidebar`} />
  )
}
