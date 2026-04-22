import { useState, useEffect } from 'react'
import { api } from '../utils/api'

function RoleBadge({ role }) {
  const colors = {
    owner: 'bg-accent-red bg-opacity-20 text-accent-red',
    admin: 'bg-accent-purple bg-opacity-20 text-accent-purple',
    member: 'bg-text-muted bg-opacity-20 text-text-muted'
  }

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${colors[role]}`}>
      {role.toUpperCase()}
    </span>
  )
}

function MemberItem({ member, currentUserRole, onRoleChange, onKick }) {
  const [showMenu, setShowMenu] = useState(false)
  const canManage = ['owner', 'admin'].includes(currentUserRole)
  const canChangeRole = currentUserRole === 'owner'
  const canKick = canManage && member.role !== 'owner' && !(currentUserRole === 'admin' && member.role === 'admin')

  return (
    <div className="flex items-center gap-3 px-4 py-2 hover:bg-bg-panel rounded-lg transition-colors">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-purple to-accent-red glow-purple-sm flex items-center justify-center font-bold text-xs">
        {member.username.substring(0, 2).toUpperCase()}
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium text-text-main">{member.username}</div>
        <div className="text-xs text-text-muted">
          {member.status === 'online' ? '🟢 Online' : '⚫ Offline'}
        </div>
      </div>
      <RoleBadge role={member.role} />

      {canManage && member.role !== 'owner' && (
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="w-6 h-6 rounded hover:bg-bg-sidebar flex items-center justify-center transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-1 w-40 bg-bg-panel border border-text-muted border-opacity-20 rounded-lg shadow-lg z-10">
              {canChangeRole && (
                <>
                  <button
                    onClick={() => {
                      onRoleChange(member.id, 'admin')
                      setShowMenu(false)
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-text-main hover:bg-bg-sidebar transition-colors"
                  >
                    Make Admin
                  </button>
                  <button
                    onClick={() => {
                      onRoleChange(member.id, 'member')
                      setShowMenu(false)
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-text-main hover:bg-bg-sidebar transition-colors"
                  >
                    Make Member
                  </button>
                </>
              )}
              {canKick && (
                <button
                  onClick={() => {
                    onKick(member.id)
                    setShowMenu(false)
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-accent-red hover:bg-accent-red hover:bg-opacity-10 transition-colors"
                >
                  Kick Member
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function SpaceSettings({ space, onClose, onUpdate }) {
  const [members, setMembers] = useState([])
  const [channels, setChannels] = useState({ text: [], voice: [] })
  const [newChannelName, setNewChannelName] = useState('')
  const [newChannelType, setNewChannelType] = useState('text')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('channels')

  const currentUserRole = space?.role
  const isGroup = space?.type === 'group'

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [membersData, channelsData] = await Promise.all([
        api.getSpaceMembers(space.id),
        api.getSpaceChannels(space.id)
      ])
      setMembers(membersData)
      setChannels(channelsData)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateChannel = async (e) => {
    e.preventDefault()
    if (!newChannelName.trim()) return

    try {
      await api.createChannel(space.id, newChannelName.trim(), newChannelType)
      setNewChannelName('')
      setNewChannelType('text')
      loadData()
      onUpdate()
    } catch (error) {
      console.error('Failed to create channel:', error)
    }
  }

  const handleDeleteChannel = async (channelId, type) => {
    if (!confirm('Delete this channel?')) return

    try {
      await api.deleteChannel(channelId, type)
      loadData()
      onUpdate()
    } catch (error) {
      console.error('Failed to delete channel:', error)
    }
  }

  const handleRoleChange = async (memberId, newRole) => {
    try {
      await api.updateMemberRole(memberId, newRole)
      loadData()
    } catch (error) {
      console.error('Failed to update role:', error)
    }
  }

  const handleKick = async (memberId) => {
    if (!confirm('Kick this member?')) return

    try {
      await api.kickMember(memberId)
      loadData()
    } catch (error) {
      console.error('Failed to kick member:', error)
    }
  }

  const canManage = ['owner', 'admin'].includes(currentUserRole)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-bg-panel rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col border-2 border-accent-purple glow-purple">
        {/* Header */}
        <div className="p-6 border-b border-text-muted border-opacity-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-text-main">{space.name} Settings</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-bg-sidebar flex items-center justify-center transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mt-4">
            <button
              onClick={() => setActiveTab('channels')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'channels'
                  ? 'bg-accent-purple text-white glow-purple-sm'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              Channels
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'members'
                  ? 'bg-accent-purple text-white glow-purple-sm'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              Members ({members.length})
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-purple to-accent-red glow-purple animate-pulse" />
            </div>
          ) : activeTab === 'channels' ? (
            <div className="space-y-4">
              {canManage && (
                <form onSubmit={handleCreateChannel} className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newChannelName}
                      onChange={(e) => setNewChannelName(e.target.value)}
                      placeholder="New channel name"
                      className="flex-1 px-4 py-2 bg-bg-sidebar rounded-lg text-text-main placeholder-text-muted
                               border-2 border-transparent focus:outline-none focus:border-accent-purple focus:glow-purple-sm transition-all"
                    />
                    <select
                      value={newChannelType}
                      onChange={(e) => setNewChannelType(e.target.value)}
                      className="px-4 py-2 bg-bg-sidebar rounded-lg text-text-main border-2 border-transparent focus:outline-none focus:border-accent-purple focus:glow-purple-sm transition-all"
                    >
                      <option value="text">Text</option>
                      {isGroup && <option value="voice">Voice</option>}
                    </select>
                    <button
                      type="submit"
                      className="px-6 py-2 rounded-lg font-semibold text-white bg-gradient-to-r from-accent-purple to-accent-red hover:glow-purple transition-all"
                    >
                      Create
                    </button>
                  </div>
                  {!isGroup && (
                    <p className="text-xs text-text-muted px-2">
                      Voice channels are only available in groups
                    </p>
                  )}
                </form>
              )}

              {/* Text Channels */}
              {channels.text && channels.text.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 px-2">
                    Text Channels
                  </div>
                  <div className="space-y-2">
                    {channels.text.map(channel => (
                      <div key={channel.id} className="flex items-center justify-between px-4 py-3 bg-bg-sidebar rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">#</span>
                          <span className="font-medium text-text-main">{channel.name}</span>
                        </div>
                        {canManage && channel.name !== 'general' && (
                          <button
                            onClick={() => handleDeleteChannel(channel.id, 'text')}
                            className="text-accent-red hover:bg-accent-red hover:bg-opacity-10 px-3 py-1 rounded transition-colors"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Voice Channels */}
              {channels.voice && channels.voice.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 px-2">
                    Voice Channels
                  </div>
                  <div className="space-y-2">
                    {channels.voice.map(channel => (
                      <div key={channel.id} className="flex items-center justify-between px-4 py-3 bg-bg-sidebar rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🔊</span>
                          <span className="font-medium text-text-main">{channel.name}</span>
                        </div>
                        {canManage && channel.name !== 'Voice Chat' && (
                          <button
                            onClick={() => handleDeleteChannel(channel.id, 'voice')}
                            className="text-accent-red hover:bg-accent-red hover:bg-opacity-10 px-3 py-1 rounded transition-colors"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {members.map(member => (
                <MemberItem
                  key={member.id}
                  member={member}
                  currentUserRole={currentUserRole}
                  onRoleChange={handleRoleChange}
                  onKick={handleKick}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
