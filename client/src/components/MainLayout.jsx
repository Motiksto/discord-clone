import { useState, useEffect } from 'react'
import ServerList from './ServerList'
import ChannelList from './ChannelList'
import ChatArea from './ChatArea'
import VoiceChannel from './VoiceChannel'
import { api } from '../utils/api'

export default function MainLayout({ user, token, onLogout }) {
  const [spaces, setSpaces] = useState([])
  const [currentSpace, setCurrentSpace] = useState(null)
  const [channels, setChannels] = useState({ text: [], voice: [] })
  const [currentChannel, setCurrentChannel] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSpaces()
  }, [])

  const loadSpaces = async () => {
    try {
      const data = await api.getSpaces()
      setSpaces(data)

      if (data.length > 0) {
        selectSpace(data[0])
      }
    } catch (error) {
      console.error('Failed to load spaces:', error)
    } finally {
      setLoading(false)
    }
  }

  const selectSpace = async (space) => {
    setCurrentSpace(space)
    setCurrentChannel(null)
    try {
      const channelData = await api.getSpaceChannels(space.id)
      setChannels(channelData)

      if (channelData.text && channelData.text.length > 0) {
        setCurrentChannel({ ...channelData.text[0], type: 'text' })
      }
    } catch (error) {
      console.error('Failed to load channels:', error)
    }
  }

  const handleChannelsUpdate = async () => {
    if (currentSpace) {
      const channelData = await api.getSpaceChannels(currentSpace.id)
      setChannels(channelData)

      // Если текущий канал был удалён, выбрать первый доступный
      if (currentChannel) {
        const allChannels = [
          ...(channelData.text || []).map(c => ({ ...c, type: 'text' })),
          ...(channelData.voice || []).map(c => ({ ...c, type: 'voice' }))
        ]
        const stillExists = allChannels.find(
          c => c.id === currentChannel.id && c.type === currentChannel.type
        )
        if (!stillExists) {
          setCurrentChannel(allChannels[0] || null)
        }
      }
    }
  }

  const handleDisconnectVoice = () => {
    // Вернуться к первому текстовому каналу
    if (channels.text && channels.text.length > 0) {
      setCurrentChannel({ ...channels.text[0], type: 'text' })
    } else {
      setCurrentChannel(null)
    }
  }

  if (loading) {
    return (
      <div className="h-screen bg-bg-main flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent-purple to-accent-red glow-purple animate-pulse" />
      </div>
    )
  }

  return (
    <div className="h-screen flex overflow-hidden">
      <ServerList
        spaces={spaces}
        currentSpace={currentSpace}
        onSelectSpace={selectSpace}
      />
      <ChannelList
        user={user}
        space={currentSpace}
        channels={channels}
        currentChannel={currentChannel}
        onSelectChannel={setCurrentChannel}
        onChannelsUpdate={handleChannelsUpdate}
        onLogout={onLogout}
      />
      {currentChannel?.type === 'voice' ? (
        <VoiceChannel
          channel={currentChannel}
          onDisconnect={handleDisconnectVoice}
        />
      ) : (
        <ChatArea
          user={user}
          token={token}
          space={currentSpace}
          channel={currentChannel}
        />
      )}
    </div>
  )
}
