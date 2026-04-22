import { useState } from 'react'

export default function SearchBar({ onSearch, onClose }) {
  const [query, setQuery] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) {
      onSearch(query.trim())
    }
  }

  return (
    <div className="absolute top-full right-0 mt-2 w-80 bg-bg-panel border-2 border-accent-purple rounded-lg shadow-lg glow-purple z-50">
      <form onSubmit={handleSubmit} className="p-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search messages..."
            autoFocus
            className="flex-1 px-3 py-2 bg-bg-sidebar rounded-lg text-text-main placeholder-text-muted
                     border-2 border-transparent focus:outline-none focus:border-accent-purple focus:glow-purple-sm transition-all"
          />
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-bg-sidebar hover:bg-accent-red hover:glow-red-sm flex items-center justify-center transition-all"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  )
}
