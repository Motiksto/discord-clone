import { useState } from 'react'
import SpaceSettings from './SpaceSettings'

function ChannelItem({ name, type, active, onClick, onDelete, canManage }) {
  const [showMenu, setShowMenu] = useState(false)
  const icon = type === 'text' ? '#' : '🔊'

  return (
    <div className="relative group">
      <div
        onClick={onClick}
        className={`
          px-3 py-2 rounded-lg cursor-pointer transition-all flex items-center gap-2
          ${active
            ? 'bg-accent-purple bg-opacity-20 text-accent-purple glow-purple-sm'
            : 'text-text-muted hover:bg-bg-panel hover:text-text-main'
          }
        `}
      >
        <span className="text-lg">{icon}</span>
        <span className="font-medium text-sm flex-1">{name}</span>

        {canManage && name !== 'general' && name !== 'Voice Chat' && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowMenu(!showMenu)
            }}
            className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded hover:bg-bg-sidebar flex items-center justify-center transition-all"
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
        )}
      </div>

      {showMenu && (
        <div className="absolute right-2 top-full mt-1 w-32 bg-bg-panel border border-text-muted border-opacity-20 rounded-lg shadow-lg z-10">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
              setShowMenu(false)
            }}
            className="w-full px-3 py-2 text-left text-sm text-accent-red hover:bg-accent-red hover:bg-opacity-10 transition-colors rounded-lg"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  )
}

export default function ChannelList({ user, space, channels, currentChannel, onSelectChannel, onChannelsUpdate, onLogout }) {
  const [showSettings, setShowSettings] = useState(false)
  const canManage = space && ['owner', 'admin'].includes(space.role)

  const handleDeleteChannel = async (channelId, type) => {
    if (!confirm('Delete this channel?')) return

    try {
      const { api } = await import('../utils/api')
      await api.deleteChannel(channelId, type)
      onChannelsUpdate()
    } catch (error) {
      console.error('Failed to delete channel:', error)
    }
  }

  const textChannels = channels?.text || []
  const voiceChannels = channels?.voice || []

  return (
    <>
      <div className="w-60 bg-bg-sidebar flex flex-col">
        {/* Server header */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-text-muted border-opacity-10 shadow-lg">
          <h2 className="font-bold text-text-main">{space?.name || 'Select Server'}</h2>
          {canManage && space && (
            <button
              onClick={() => setShowSettings(true)}
              className="w-6 h-6 rounded hover:bg-bg-panel flex items-center justify-center transition-colors"
              title="Server Settings"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>

        {/* Channels */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {textChannels.length > 0 && (
            <>
              <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 px-2">
                Text Channels
              </div>
              {textChannels.map(channel => (
                <ChannelItem
                  key={channel.id}
                  name={channel.name}
                  type="text"
                  active={currentChannel?.id === channel.id && currentChannel?.type === 'text'}
                  onClick={() => onSelectChannel({ ...channel, type: 'text' })}
                  onDelete={() => handleDeleteChannel(channel.id, 'text')}
                  canManage={canManage}
                />
              ))}
            </>
          )}

          {voiceChannels.length > 0 && (
            <>
              <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 px-2 mt-4">
                Voice Channels
              </div>
              {voiceChannels.map(channel => (
                <ChannelItem
                  key={channel.id}
                  name={channel.name}
                  type="voice"
                  active={currentChannel?.id === channel.id && currentChannel?.type === 'voice'}
                  onClick={() => onSelectChannel({ ...channel, type: 'voice' })}
                  onDelete={() => handleDeleteChannel(channel.id, 'voice')}
                  canManage={canManage}
                />
              ))}
            </>
          )}

          {textChannels.length === 0 && voiceChannels.length === 0 && (
            <div className="text-center text-text-muted text-sm py-8">
              No channels available
            </div>
          )}
        </div>

        {/* User info */}
        <div className="h-16 bg-bg-panel px-3 flex items-center gap-3 border-t border-text-muted border-opacity-10">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-purple to-accent-red glow-purple-sm flex items-center justify-center font-bold">
            {user?.username?.substring(0, 2).toUpperCase() || 'U'}
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-text-main">{user?.username || 'User'}</div>
            <div className="text-xs text-text-muted">#{user?.id || '0000'}</div>
          </div>
          <button
            onClick={onLogout}
            className="w-8 h-8 rounded-full bg-bg-sidebar hover:bg-accent-red hover:glow-red-sm flex items-center justify-center cursor-pointer transition-all"
            title="Logout"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {showSettings && space && (
        <SpaceSettings
          space={space}
          onClose={() => setShowSettings(false)}
          onUpdate={onChannelsUpdate}
        />
      )}
    </>
  )
}
