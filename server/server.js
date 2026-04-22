import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
import { AccessToken } from 'livekit-server-sdk'
import {
  createUser,
  getUserByUsername,
  getUserById,
  updateUserStatus,
  createSpace,
  getUserSpaces,
  getSpaceById,
  addSpaceMember,
  getSpaceMember,
  getSpaceMembers,
  updateMemberRole,
  removeMember,
  createTextChannel,
  getSpaceChannels,
  getChannelById,
  deleteTextChannel,
  createVoiceChannel,
  getSpaceVoiceChannels,
  getVoiceChannelById,
  deleteVoiceChannel,
  createOrGetDirectChat,
  getUserDirectChats,
  getDirectChatById,
  createMessage,
  getMessages
} from './db.js'
import { generateToken, authMiddleware, authenticateSocket } from './auth.js'

dotenv.config()

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PATCH', 'DELETE']
  }
})

app.use(cors())
app.use(express.json())

// ============ AUTH ROUTES ============
app.post('/auth/register', async (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' })
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' })
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10)
    const result = createUser(username, passwordHash)
    const token = generateToken(result.lastInsertRowid)

    res.json({
      token,
      user: {
        id: result.lastInsertRowid,
        username,
        avatar: null,
        status: 'offline'
      }
    })
  } catch (error) {
    res.status(400).json({ error: 'Username already exists' })
  }
})

app.post('/auth/login', async (req, res) => {
  const { username, password } = req.body

  const user = getUserByUsername(username)
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  const token = generateToken(user.id)
  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      avatar: user.avatar,
      status: user.status
    }
  })
})

// ============ SPACES ROUTES ============
app.get('/spaces', authMiddleware, (req, res) => {
  const spaces = getUserSpaces(req.userId)
  res.json(spaces)
})

app.post('/spaces', authMiddleware, (req, res) => {
  const { name, type } = req.body

  if (!name || !type) {
    return res.status(400).json({ error: 'Name and type required' })
  }

  if (!['group', 'channel'].includes(type)) {
    return res.status(400).json({ error: 'Type must be group or channel' })
  }

  try {
    const result = createSpace(name, type, req.userId)

    // Создать каналы по умолчанию
    createTextChannel(result.lastInsertRowid, 'general')
    if (type === 'group') {
      createVoiceChannel(result.lastInsertRowid, 'Voice Chat')
    }

    res.json({
      id: result.lastInsertRowid,
      name,
      type,
      owner_id: req.userId
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to create space' })
  }
})

app.get('/spaces/:id/channels', authMiddleware, (req, res) => {
  const spaceId = parseInt(req.params.id)

  const member = getSpaceMember(spaceId, req.userId)
  if (!member) {
    return res.status(403).json({ error: 'Not a member of this space' })
  }

  const textChannels = getSpaceChannels(spaceId)
  const voiceChannels = getSpaceVoiceChannels(spaceId)

  res.json({
    text: textChannels,
    voice: voiceChannels
  })
})

app.post('/spaces/:id/channels', authMiddleware, (req, res) => {
  const spaceId = parseInt(req.params.id)
  const { name, type } = req.body

  if (!name) {
    return res.status(400).json({ error: 'Channel name required' })
  }

  if (!['text', 'voice'].includes(type)) {
    return res.status(400).json({ error: 'Type must be text or voice' })
  }

  const member = getSpaceMember(spaceId, req.userId)
  if (!member || !['owner', 'admin'].includes(member.role)) {
    return res.status(403).json({ error: 'Insufficient permissions' })
  }

  // Проверить, что голосовые каналы только в группах
  const space = getSpaceById(spaceId)
  if (type === 'voice' && space.type !== 'group') {
    return res.status(400).json({ error: 'Voice channels only available in groups' })
  }

  try {
    const result = type === 'text'
      ? createTextChannel(spaceId, name)
      : createVoiceChannel(spaceId, name)

    res.json({
      id: result.lastInsertRowid,
      space_id: spaceId,
      name,
      type
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to create channel' })
  }
})

app.get('/spaces/:id/members', authMiddleware, (req, res) => {
  const spaceId = parseInt(req.params.id)

  const member = getSpaceMember(spaceId, req.userId)
  if (!member) {
    return res.status(403).json({ error: 'Not a member of this space' })
  }

  const members = getSpaceMembers(spaceId)
  res.json(members)
})

// ============ CHANNELS ROUTES ============
app.get('/channels/:id/messages', authMiddleware, (req, res) => {
  const channelId = parseInt(req.params.id)

  const channel = getChannelById(channelId)
  if (!channel) {
    return res.status(404).json({ error: 'Channel not found' })
  }

  const member = getSpaceMember(channel.space_id, req.userId)
  if (!member) {
    return res.status(403).json({ error: 'Not a member of this space' })
  }

  const messages = getMessages('channel', channelId)
  res.json(messages)
})

app.delete('/channels/:id', authMiddleware, (req, res) => {
  const channelId = parseInt(req.params.id)
  const { type } = req.query

  const channel = type === 'voice'
    ? getVoiceChannelById(channelId)
    : getChannelById(channelId)

  if (!channel) {
    return res.status(404).json({ error: 'Channel not found' })
  }

  const member = getSpaceMember(channel.space_id, req.userId)
  if (!member || !['owner', 'admin'].includes(member.role)) {
    return res.status(403).json({ error: 'Insufficient permissions' })
  }

  try {
    if (type === 'voice') {
      deleteVoiceChannel(channelId)
    } else {
      deleteTextChannel(channelId)
    }
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete channel' })
  }
})

// ============ LIVEKIT ROUTES ============
app.post('/livekit/token', authMiddleware, async (req, res) => {
  const { roomName, channelId } = req.body

  if (!roomName || !channelId) {
    return res.status(400).json({ error: 'Room name and channel ID required' })
  }

  // Проверить доступ к голосовому каналу
  const voiceChannel = getVoiceChannelById(channelId)
  if (!voiceChannel) {
    return res.status(404).json({ error: 'Voice channel not found' })
  }

  const member = getSpaceMember(voiceChannel.space_id, req.userId)
  if (!member) {
    return res.status(403).json({ error: 'Not a member of this space' })
  }

  const user = getUserById(req.userId)

  try {
    const at = new AccessToken(
      process.env.LIVEKIT_API_KEY,
      process.env.LIVEKIT_API_SECRET,
      {
        identity: `${user.id}`,
        name: user.username
      }
    )

    at.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true
    })

    const token = await at.toJwt()

    res.json({
      token,
      url: process.env.LIVEKIT_URL
    })
  } catch (error) {
    console.error('Failed to generate LiveKit token:', error)
    res.status(500).json({ error: 'Failed to generate token' })
  }
})

// ============ SPACE MEMBERS ROUTES ============
app.patch('/space_members/:id/role', authMiddleware, (req, res) => {
  const memberId = parseInt(req.params.id)
  const { role } = req.body

  if (!role || !['owner', 'admin', 'member'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' })
  }

  const memberInfo = getSpaceMembers(0).find(m => m.id === memberId)
  if (!memberInfo) {
    return res.status(404).json({ error: 'Member not found' })
  }

  const requester = getSpaceMember(memberInfo.space_id, req.userId)
  if (!requester || requester.role !== 'owner') {
    return res.status(403).json({ error: 'Only owner can change roles' })
  }

  try {
    updateMemberRole(memberId, role)
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Failed to update role' })
  }
})

app.delete('/space_members/:id', authMiddleware, (req, res) => {
  const memberId = parseInt(req.params.id)

  const memberInfo = getSpaceMembers(0).find(m => m.id === memberId)
  if (!memberInfo) {
    return res.status(404).json({ error: 'Member not found' })
  }

  const requester = getSpaceMember(memberInfo.space_id, req.userId)
  if (!requester || !['owner', 'admin'].includes(requester.role)) {
    return res.status(403).json({ error: 'Insufficient permissions' })
  }

  if (memberInfo.role === 'owner') {
    return res.status(403).json({ error: 'Cannot kick owner' })
  }

  if (requester.role === 'admin' && memberInfo.role === 'admin') {
    return res.status(403).json({ error: 'Admin cannot kick another admin' })
  }

  try {
    removeMember(memberId)
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove member' })
  }
})

// ============ DIRECT MESSAGES ROUTES ============
app.get('/dm', authMiddleware, (req, res) => {
  const chats = getUserDirectChats(req.userId)
  res.json(chats)
})

app.post('/dm/:user_id', authMiddleware, (req, res) => {
  const otherUserId = parseInt(req.params.user_id)

  if (otherUserId === req.userId) {
    return res.status(400).json({ error: 'Cannot create chat with yourself' })
  }

  const otherUser = getUserById(otherUserId)
  if (!otherUser) {
    return res.status(404).json({ error: 'User not found' })
  }

  try {
    const chat = createOrGetDirectChat(req.userId, otherUserId)
    res.json({
      ...chat,
      other_user: otherUser
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to create chat' })
  }
})

app.get('/dm/:chat_id/messages', authMiddleware, (req, res) => {
  const chatId = parseInt(req.params.chat_id)

  const chat = getDirectChatById(chatId)
  if (!chat) {
    return res.status(404).json({ error: 'Chat not found' })
  }

  if (chat.user1_id !== req.userId && chat.user2_id !== req.userId) {
    return res.status(403).json({ error: 'Access denied' })
  }

  const messages = getMessages('direct', chatId)
  res.json(messages)
})

// ============ SOCKET.IO ============
io.use(authenticateSocket)

io.on('connection', (socket) => {
  console.log('User connected:', socket.userId)

  updateUserStatus(socket.userId, 'online')
  io.emit('user_status', { userId: socket.userId, status: 'online' })

  socket.on('join_channel', (channelId) => {
    const channel = getChannelById(channelId)
    if (!channel) return

    const member = getSpaceMember(channel.space_id, socket.userId)
    if (member) {
      socket.join(`channel:${channelId}`)
      console.log(`User ${socket.userId} joined channel ${channelId}`)
    }
  })

  socket.on('join_dm', (chatId) => {
    const chat = getDirectChatById(chatId)
    if (!chat) return

    if (chat.user1_id === socket.userId || chat.user2_id === socket.userId) {
      socket.join(`dm:${chatId}`)
      console.log(`User ${socket.userId} joined DM ${chatId}`)
    }
  })

  socket.on('send_message', ({ type, target_id, content, token }) => {
    if (!content || !content.trim()) return

    if (type === 'channel') {
      const channel = getChannelById(target_id)
      if (!channel) return

      const member = getSpaceMember(channel.space_id, socket.userId)
      if (!member) return

      const space = getSpaceById(channel.space_id)
      if (space.type === 'channel' && !['owner', 'admin'].includes(member.role)) {
        return socket.emit('error', { message: 'Only channel owner/admin can post' })
      }

      const result = createMessage('channel', target_id, socket.userId, content.trim())
      const user = getUserById(socket.userId)

      const message = {
        id: result.lastInsertRowid,
        type: 'channel',
        target_id,
        user_id: socket.userId,
        username: user.username,
        avatar: user.avatar,
        content: content.trim(),
        created_at: new Date().toISOString()
      }

      io.to(`channel:${target_id}`).emit('new_message', message)

    } else if (type === 'direct') {
      const chat = getDirectChatById(target_id)
      if (!chat) return

      if (chat.user1_id !== socket.userId && chat.user2_id !== socket.userId) {
        return
      }

      const result = createMessage('direct', target_id, socket.userId, content.trim())
      const user = getUserById(socket.userId)

      const message = {
        id: result.lastInsertRowid,
        type: 'direct',
        target_id,
        user_id: socket.userId,
        username: user.username,
        avatar: user.avatar,
        content: content.trim(),
        created_at: new Date().toISOString()
      }

      io.to(`dm:${target_id}`).emit('new_message', message)
    }
  })

  socket.on('typing', ({ type, targetId }) => {
    const user = getUserById(socket.userId)
    const room = type === 'channel' ? `channel:${targetId}` : `dm:${targetId}`

    socket.to(room).emit('user_typing', {
      type,
      targetId,
      username: user.username
    })
  })

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.userId)
    updateUserStatus(socket.userId, 'offline')
    io.emit('user_status', { userId: socket.userId, status: 'offline' })
  })
})

const PORT = 3000
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
