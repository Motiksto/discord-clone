import { useState } from 'react'

export default function TitleBar() {
  const [isMaximized, setIsMaximized] = useState(false)

  const handleMinimize = async () => {
    if (window.__TAURI__) {
      const { appWindow } = await import('@tauri-apps/api/window')
      appWindow.minimize()
    }
  }

  const handleMaximize = async () => {
    if (window.__TAURI__) {
      const { appWindow } = await import('@tauri-apps/api/window')
      await appWindow.toggleMaximize()
      setIsMaximized(await appWindow.isMaximized())
    }
  }

  const handleClose = async () => {
    if (window.__TAURI__) {
      const { appWindow } = await import('@tauri-apps/api/window')
      appWindow.close()
    }
  }

  return (
    <div
      data-tauri-drag-region
      className="h-8 bg-bg-sidebar flex items-center justify-between px-3 select-none border-b border-text-muted border-opacity-10"
    >
      {/* App Title */}
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded bg-gradient-to-br from-accent-purple to-accent-red glow-purple-sm flex items-center justify-center text-xs font-bold">
          ⚡
        </div>
        <span className="text-sm font-semibold text-text-main">Discord Clone</span>
      </div>

      {/* Window Controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={handleMinimize}
          className="w-8 h-8 rounded hover:bg-bg-panel flex items-center justify-center transition-colors"
          title="Minimize"
        >
          <svg className="w-3 h-3 text-text-main" fill="currentColor" viewBox="0 0 12 12">
            <rect x="0" y="5" width="12" height="2" />
          </svg>
        </button>

        <button
          onClick={handleMaximize}
          className="w-8 h-8 rounded hover:bg-accent-purple hover:glow-purple-sm flex items-center justify-center transition-all"
          title={isMaximized ? 'Restore' : 'Maximize'}
        >
          <svg className="w-3 h-3 text-text-main" fill="currentColor" viewBox="0 0 12 12">
            {isMaximized ? (
              <>
                <rect x="0" y="2" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <rect x="2" y="0" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </>
            ) : (
              <rect x="0" y="0" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" />
            )}
          </svg>
        </button>

        <button
          onClick={handleClose}
          className="w-8 h-8 rounded hover:bg-accent-red hover:glow-red-sm flex items-center justify-center transition-all"
          title="Close"
        >
          <svg className="w-3 h-3 text-text-main" fill="currentColor" viewBox="0 0 12 12">
            <path d="M11.8 1.6L10.4 0.2 6 4.6 1.6 0.2 0.2 1.6 4.6 6 0.2 10.4 1.6 11.8 6 7.4 10.4 11.8 11.8 10.4 7.4 6z" />
          </svg>
        </button>
      </div>
    </div>
  )
}
