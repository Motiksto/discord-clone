import { io } from 'socket.io-client'

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'

let socket = null

export const initSocket = (token) => {
  if (socket?.connected) {
    return socket
  }

  socket = io(SERVER_URL, {
    auth: { token }
  })

  socket.on('connect', () => {
    console.log('Socket connected:', socket.id)
  })

  socket.on('disconnect', () => {
    console.log('Socket disconnected')
  })

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error.message)
  })

  return socket
}

export const getSocket = () => socket

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export const joinChannel = (channelId) => {
  if (socket) {
    socket.emit('join_channel', channelId)
  }
}

export const joinDM = (chatId) => {
  if (socket) {
    socket.emit('join_dm', chatId)
  }
}

export const sendMessage = (data) => {
  if (socket) {
    socket.emit('send_message', data)
  }
}

export const onNewMessage = (callback) => {
  if (socket) {
    socket.on('new_message', callback)
  }
}

export const offNewMessage = () => {
  if (socket) {
    socket.off('new_message')
  }
}

export const onUserTyping = (callback) => {
  if (socket) {
    socket.on('user_typing', callback)
  }
}

export const offUserTyping = () => {
  if (socket) {
    socket.off('user_typing')
  }
}

export const emitTyping = (type, targetId) => {
  if (socket) {
    socket.emit('typing', { type, targetId })
  }
}
