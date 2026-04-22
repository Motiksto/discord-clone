import { useState, useEffect, useRef } from 'react'
import { api } from '../utils/api'
import { joinChannel, sendMessage, onNewMessage, offNewMessage, emitTyping } from '../utils/socket'

function Message({ username, avatar, content, time, isOwn }) {
  return (
    <div className={`flex gap-3 px-6 py-3 hover:bg-bg-panel transition-colors ${isOwn ? 'bg-bg-panel bg-opacity-30' : ''}`}>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
        isOwn
          ? 'bg-gradient-to-br from-accent-purple to-accent-red glow-purple-sm'
          : 'bg-bg-sidebar'
      }`}>
        {avatar}
      </div>
      <div className="flex-1">
        <div className="flex items-baseline gap-2 mb-1">
          <span className={`font-semibold text-sm ${isOwn ? 'text-accent-purple' : 'text-text-main'}`}>
            {username}
          </span>
          <span className="text-xs text-text-muted">{time}</span>
        </div>
        <p className="text-text-main text-sm leading-relaxed">{content}</p>
      </div>
    </div>
  )
}

export default function ChatArea({ user, token, space, channel }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [canWrite, setCanWrite] = useState(true)
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  useEffect(() => {
    if (!channel) {
      setMessages([])
      return
    }

    loadMessages()
    joinChannel(channel.id)

    // Слушать новые сообщения
    onNewMessage(handleNewMessage)

    return () => {
      offNewMessage()
    }
  }, [channel])

  useEffect(() => {
    // Проверить права на запись
    if (space && space.type === 'channel' && space.role !== 'owner' && space.role !== 'admin') {
      setCanWrite(false)
    } else {
      setCanWrite(true)
    }
  }, [space])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadMessages = async () => {
    if (!channel) return

    setLoading(true)
    try {
      const data = await api.getChannelMessages(channel.id)
      setMessages(data)
    } catch (error) {
      console.error('Failed to load messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleNewMessage = (message) => {
    if (message.target_id === channel?.id && message.type === 'channel') {
      setMessages(prev => [...prev, message])
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!input.trim() || !channel || !canWrite) return

    sendMessage({
      type: 'channel',
      target_id: channel.id,
      content: input.trim(),
      token
    })

    setInput('')
  }

  const handleTyping = () => {
    if (!channel) return

    emitTyping('channel', channel.id)

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      // Typing stopped
    }, 1000)
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  if (!channel) {
    return (
      <div className="flex-1 flex items-center justify-center bg-bg-main">
        <div className="text-center">
          <div className="text-4xl mb-4">💬</div>
          <p className="text-text-muted">Select a channel to start chatting</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-bg-main">
      {/* Channel header */}
      <div className="h-14 px-6 flex items-center border-b border-text-muted border-opacity-10 bg-bg-panel shadow-lg">
        <span className="text-2xl mr-2">#</span>
        <h2 className="font-bold text-text-main">{channel.name}</h2>
        {space?.type === 'channel' && (
          <div className="ml-4 px-2 py-1 bg-accent-purple bg-opacity-20 rounded text-xs text-accent-purple font-semibold">
            CHANNEL
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-purple to-accent-red glow-purple animate-pulse" />
          </div>
        ) : (
          <div className="py-4">
            {messages.length === 0 ? (
              <div className="text-center text-text-muted py-8">
                No messages yet. Start the conversation!
              </div>
            ) : (
              messages.map(msg => (
                <Message
                  key={msg.id}
                  username={msg.username}
                  avatar={msg.avatar || msg.username?.substring(0, 2).toUpperCase()}
                  content={msg.content}
                  time={formatTime(msg.created_at)}
                  isOwn={msg.user_id === user.id}
                />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message input */}
      <div className="p-4">
        <form onSubmit={handleSubmit}>
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                handleTyping()
              }}
              disabled={!canWrite}
              placeholder={canWrite ? `Message #${channel.name}` : 'Только чтение'}
              className={`w-full px-4 py-3 rounded-xl text-text-main placeholder-text-muted
                       border-2 border-transparent
                       focus:outline-none transition-all
                       ${canWrite
                         ? 'bg-bg-panel focus:border-accent-purple focus:glow-purple'
                         : 'bg-bg-sidebar cursor-not-allowed opacity-50'
                       }`}
            />
            {canWrite && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
                <button
                  type="button"
                  className="w-8 h-8 rounded-lg bg-bg-sidebar hover:bg-accent-purple hover:glow-purple-sm flex items-center justify-center transition-all"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" clipRule="evenodd" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="w-8 h-8 rounded-lg bg-bg-sidebar hover:bg-accent-red hover:glow-red-sm flex items-center justify-center transition-all"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
