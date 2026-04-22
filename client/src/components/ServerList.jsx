function ServerIcon({ name, active, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`
        w-12 h-12 rounded-full flex items-center justify-center
        font-semibold text-sm cursor-pointer transition-all
        ${active
          ? 'bg-gradient-to-br from-accent-purple to-accent-red glow-purple'
          : 'bg-bg-panel hover:bg-bg-sidebar hover:glow-purple-sm'
        }
      `}
    >
      {name.substring(0, 2).toUpperCase()}
    </div>
  )
}

export default function ServerList({ spaces, currentSpace, onSelectSpace }) {
  return (
    <div className="w-20 bg-bg-sidebar flex flex-col items-center py-4 gap-3">
      {/* Home button */}
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-purple to-accent-red glow-purple flex items-center justify-center cursor-pointer">
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
      </div>

      <div className="w-10 h-px bg-text-muted opacity-20"></div>

      {/* Server icons */}
      {spaces.map(space => (
        <ServerIcon
          key={space.id}
          name={space.name}
          active={currentSpace?.id === space.id}
          onClick={() => onSelectSpace(space)}
        />
      ))}

      {/* Add server button */}
      <div className="w-12 h-12 rounded-full bg-bg-panel hover:bg-accent-purple hover:glow-purple-sm flex items-center justify-center cursor-pointer transition-all">
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
      </div>

      {/* Bottom buttons */}
      <div className="mt-auto flex flex-col gap-3">
        <div className="w-12 h-12 rounded-full bg-bg-panel hover:bg-accent-red hover:glow-red-sm flex items-center justify-center cursor-pointer transition-all">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
            <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
          </svg>
        </div>

        <div className="w-12 h-12 rounded-full bg-bg-panel hover:bg-text-muted hover:glow-purple-sm flex items-center justify-center cursor-pointer transition-all">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
    </div>
  )
}
