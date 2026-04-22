const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'

const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
}

export const api = {
  // Auth
  register: async (username, password) => {
    const res = await fetch(`${SERVER_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
    return res.json()
  },

  login: async (username, password) => {
    const res = await fetch(`${SERVER_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
    return res.json()
  },

  updateStatus: async (status, customStatus = null) => {
    const res = await fetch(`${SERVER_URL}/users/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, customStatus })
    })
    return res.json()
  },

  // Spaces
  getSpaces: async () => {
    const res = await fetch(`${SERVER_URL}/spaces`, {
      headers: getAuthHeaders()
    })
    return res.json()
  },

  joinByInvite: async (code) => {
    const res = await fetch(`${SERVER_URL}/invite/${code}`, {
      method: 'POST',
      headers: getAuthHeaders()
    })
    return res.json()
  },

  getSpaceChannels: async (spaceId) => {
    const res = await fetch(`${SERVER_URL}/spaces/${spaceId}/channels`, {
      headers: getAuthHeaders()
    })
    return res.json()
  },

  createChannel: async (spaceId, name, type = 'text') => {
    const res = await fetch(`${SERVER_URL}/spaces/${spaceId}/channels`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name, type })
    })
    return res.json()
  },

  deleteChannel: async (channelId, type = 'text') => {
    const res = await fetch(`${SERVER_URL}/channels/${channelId}?type=${type}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    })
    return res.json()
  },

  getSpaceMembers: async (spaceId) => {
    const res = await fetch(`${SERVER_URL}/spaces/${spaceId}/members`, {
      headers: getAuthHeaders()
    })
    return res.json()
  },

  updateMemberRole: async (memberId, role) => {
    const res = await fetch(`${SERVER_URL}/space_members/${memberId}/role`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ role })
    })
    return res.json()
  },

  kickMember: async (memberId) => {
    const res = await fetch(`${SERVER_URL}/space_members/${memberId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    })
    return res.json()
  },

  // Channels
  getChannelMessages: async (channelId) => {
    const res = await fetch(`${SERVER_URL}/channels/${channelId}/messages`, {
      headers: getAuthHeaders()
    })
    return res.json()
  },

  searchMessages: async (channelId, query) => {
    const res = await fetch(`${SERVER_URL}/channels/${channelId}/search?q=${encodeURIComponent(query)}`, {
      headers: getAuthHeaders()
    })
    return res.json()
  },

  deleteMessage: async (messageId) => {
    const res = await fetch(`${SERVER_URL}/messages/${messageId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    })
    return res.json()
  },

  // Reactions
  addReaction: async (messageId, emoji) => {
    const res = await fetch(`${SERVER_URL}/messages/${messageId}/reactions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ emoji })
    })
    return res.json()
  },

  removeReaction: async (messageId, emoji) => {
    const res = await fetch(`${SERVER_URL}/messages/${messageId}/reactions/${emoji}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    })
    return res.json()
  },

  getReactions: async (messageId) => {
    const res = await fetch(`${SERVER_URL}/messages/${messageId}/reactions`, {
      headers: getAuthHeaders()
    })
    return res.json()
  },

  // LiveKit
  getLiveKitToken: async (roomName, channelId) => {
    const res = await fetch(`${SERVER_URL}/livekit/token`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ roomName, channelId })
    })
    return res.json()
  },

  // Direct Messages
  getDirectChats: async () => {
    const res = await fetch(`${SERVER_URL}/dm`, {
      headers: getAuthHeaders()
    })
    return res.json()
  },

  getDMMessages: async (chatId) => {
    const res = await fetch(`${SERVER_URL}/dm/${chatId}/messages`, {
      headers: getAuthHeaders()
    })
    return res.json()
  },

  searchDMMessages: async (chatId, query) => {
    const res = await fetch(`${SERVER_URL}/dm/${chatId}/search?q=${encodeURIComponent(query)}`, {
      headers: getAuthHeaders()
    })
    return res.json()
  },

  createOrOpenDM: async (userId) => {
    const res = await fetch(`${SERVER_URL}/dm/${userId}`, {
      method: 'POST',
      headers: getAuthHeaders()
    })
    return res.json()
  },

  markAsRead: async (type, targetId, messageId) => {
    const res = await fetch(`${SERVER_URL}/read`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ type, targetId, messageId })
    })
    return res.json()
  }
}
