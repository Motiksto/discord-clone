export default function UnreadBadge({ count }) {
  if (!count || count === 0) return null

  return (
    <div className="min-w-[18px] h-[18px] px-1 bg-accent-purple rounded-full flex items-center justify-center glow-purple-sm">
      <span className="text-xs font-bold text-white">
        {count > 99 ? '99+' : count}
      </span>
    </div>
  )
}
