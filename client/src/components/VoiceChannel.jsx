import { useState, useEffect } from 'react'
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useParticipants,
  useTracks,
  useLocalParticipant
} from '@livekit/components-react'
import { Track } from 'livekit-client'
import '@livekit/components-styles'
import { api } from '../utils/api'

function VoiceParticipant({ participant, isSpeaking }) {
  const name = participant.name || participant.identity

  return (
    <div className="flex items-center gap-3 px-4 py-2">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
          isSpeaking
            ? 'bg-gradient-to-br from-accent-purple to-accent-red glow-purple animate-pulse'
            : 'bg-bg-sidebar'
        }`}
      >
        {name.substring(0, 2).toUpperCase()}
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium text-text-main">{name}</div>
        <div className="text-xs text-text-muted">
          {isSpeaking ? '🎤 Speaking' : '🔇 Muted'}
        </div>
      </div>
    </div>
  )
}

function VoiceControls({ onDisconnect }) {
  const { localParticipant } = useLocalParticipant()
  const [micEnabled, setMicEnabled] = useState(true)
  const [videoEnabled, setVideoEnabled] = useState(false)

  const toggleMic = () => {
    localParticipant.setMicrophoneEnabled(!micEnabled)
    setMicEnabled(!micEnabled)
  }

  const toggleVideo = () => {
    localParticipant.setCameraEnabled(!videoEnabled)
    setVideoEnabled(!videoEnabled)
  }

  return (
    <div className="flex items-center justify-center gap-3 p-4 border-t border-text-muted border-opacity-10">
      <button
        onClick={toggleMic}
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
          micEnabled
            ? 'bg-bg-sidebar hover:bg-accent-purple hover:glow-purple-sm'
            : 'bg-accent-red glow-red-sm'
        }`}
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          {micEnabled ? (
            <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
          ) : (
            <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
          )}
        </svg>
      </button>

      <button
        onClick={toggleVideo}
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
          videoEnabled
            ? 'bg-bg-sidebar hover:bg-accent-purple hover:glow-purple-sm'
            : 'bg-bg-panel hover:bg-bg-sidebar'
        }`}
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
        </svg>
      </button>

      <button
        onClick={onDisconnect}
        className="w-12 h-12 rounded-full bg-accent-red glow-red flex items-center justify-center hover:scale-110 transition-all"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  )
}

function VoiceRoomContent({ onDisconnect }) {
  const participants = useParticipants()
  const tracks = useTracks([Track.Source.Microphone])

  const speakingParticipants = new Set(
    tracks
      .filter(track => track.publication.isSpeaking)
      .map(track => track.participant.identity)
  )

  return (
    <div className="flex-1 flex flex-col bg-bg-main">
      <div className="h-14 px-6 flex items-center border-b border-text-muted border-opacity-10 bg-bg-panel shadow-lg">
        <span className="text-2xl mr-2">🔊</span>
        <h2 className="font-bold text-text-main">Voice Channel</h2>
        <div className="ml-4 px-2 py-1 bg-accent-purple bg-opacity-20 rounded text-xs text-accent-purple font-semibold">
          {participants.length} CONNECTED
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 px-4">
          Participants
        </div>
        <div className="space-y-1">
          {participants.map(participant => (
            <VoiceParticipant
              key={participant.identity}
              participant={participant}
              isSpeaking={speakingParticipants.has(participant.identity)}
            />
          ))}
        </div>
      </div>

      <VoiceControls onDisconnect={onDisconnect} />
      <RoomAudioRenderer />
    </div>
  )
}

export default function VoiceChannel({ channel, onDisconnect }) {
  const [token, setToken] = useState(null)
  const [livekitUrl, setLivekitUrl] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadToken()
  }, [channel])

  const loadToken = async () => {
    try {
      const roomName = `voice-${channel.space_id}-${channel.id}`
      const data = await api.getLiveKitToken(roomName, channel.id)

      setToken(data.token)
      setLivekitUrl(data.url)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-bg-main">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent-purple to-accent-red glow-purple animate-pulse" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-bg-main">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <p className="text-accent-red mb-4">{error}</p>
          <button
            onClick={onDisconnect}
            className="px-6 py-2 rounded-lg font-semibold text-white bg-gradient-to-r from-accent-purple to-accent-red hover:glow-purple transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <LiveKitRoom
      token={token}
      serverUrl={livekitUrl}
      connect={true}
      audio={true}
      video={false}
    >
      <VoiceRoomContent onDisconnect={onDisconnect} />
    </LiveKitRoom>
  )
}
