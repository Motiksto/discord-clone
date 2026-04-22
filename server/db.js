import Database from 'better-sqlite3'

const db = new Database('discord.db')

// Создание таблиц
db.exec(`
  -- Пользователи
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    avatar TEXT,
    status TEXT DEFAULT 'offline' CHECK(status IN ('online', 'offline', 'away', 'dnd')),
    custom_status TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Группы и каналы (серверы)
  CREATE TABLE IF NOT EXISTS spaces (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('group', 'channel')),
    owner_id INTEGER NOT NULL,
    invite_code TEXT UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id)
  );

  -- Участники групп/каналов
  CREATE TABLE IF NOT EXISTS space_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    space_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('owner', 'admin', 'member')),
    last_read_message_id INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (space_id) REFERENCES spaces(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(space_id, user_id)
  );

  -- Текстовые каналы внутри групп
  CREATE TABLE IF NOT EXISTS text_channels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    space_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (space_id) REFERENCES spaces(id) ON DELETE CASCADE
  );

  -- Голосовые каналы внутри групп
  CREATE TABLE IF NOT EXISTS voice_channels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    space_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (space_id) REFERENCES spaces(id) ON DELETE CASCADE
  );

  -- Личные чаты
  CREATE TABLE IF NOT EXISTS direct_chats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user1_id INTEGER NOT NULL,
    user2_id INTEGER NOT NULL,
    user1_last_read INTEGER DEFAULT 0,
    user2_last_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user1_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (user2_id) REFERENCES users(id) ON DELETE CASCADE,
    CHECK(user1_id < user2_id),
    UNIQUE(user1_id, user2_id)
  );

  -- Сообщения (универсальные)
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL CHECK(type IN ('channel', 'direct')),
    target_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- Реакции на сообщения
  CREATE TABLE IF NOT EXISTS message_reactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    emoji TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(message_id, user_id, emoji)
  );

  -- Индексы для производительности
  CREATE INDEX IF NOT EXISTS idx_space_members_user ON space_members(user_id);
  CREATE INDEX IF NOT EXISTS idx_space_members_space ON space_members(space_id);
  CREATE INDEX IF NOT EXISTS idx_messages_target ON messages(type, target_id);
  CREATE INDEX IF NOT EXISTS idx_messages_search ON messages(content);
  CREATE INDEX IF NOT EXISTS idx_direct_chats_users ON direct_chats(user1_id, user2_id);
  CREATE INDEX IF NOT EXISTS idx_reactions_message ON message_reactions(message_id);
`)

// ============ USERS ============
export const createUser = (username, passwordHash, avatar = null) => {
  const stmt = db.prepare('INSERT INTO users (username, password_hash, avatar) VALUES (?, ?, ?)')
  return stmt.run(username, passwordHash, avatar)
}

export const getUserByUsername = (username) => {
  const stmt = db.prepare('SELECT * FROM users WHERE username = ?')
  return stmt.get(username)
}

export const getUserById = (id) => {
  const stmt = db.prepare('SELECT id, username, avatar, status, custom_status, created_at FROM users WHERE id = ?')
  return stmt.get(id)
}

export const updateUserStatus = (userId, status, customStatus = null) => {
  const stmt = db.prepare('UPDATE users SET status = ?, custom_status = ? WHERE id = ?')
  return stmt.run(status, customStatus, userId)
}

// ============ SPACES ============
export const createSpace = (name, type, ownerId) => {
  const inviteCode = Math.random().toString(36).substring(2, 10)
  const stmt = db.prepare('INSERT INTO spaces (name, type, owner_id, invite_code) VALUES (?, ?, ?, ?)')
  const result = stmt.run(name, type, ownerId, inviteCode)

  const memberStmt = db.prepare('INSERT INTO space_members (space_id, user_id, role) VALUES (?, ?, ?)')
  memberStmt.run(result.lastInsertRowid, ownerId, 'owner')

  return result
}

export const getUserSpaces = (userId) => {
  const stmt = db.prepare(`
    SELECT s.*, sm.role, sm.last_read_message_id,
      (SELECT COUNT(*) FROM space_members WHERE space_id = s.id) as member_count,
      (SELECT COUNT(*) FROM messages m
       JOIN text_channels tc ON m.target_id = tc.id
       WHERE tc.space_id = s.id AND m.type = 'channel' AND m.id > sm.last_read_message_id) as unread_count
    FROM spaces s
    JOIN space_members sm ON s.id = sm.space_id
    WHERE sm.user_id = ?
    ORDER BY s.created_at DESC
  `)
  return stmt.all(userId)
}

export const getSpaceById = (spaceId) => {
  const stmt = db.prepare('SELECT * FROM spaces WHERE id = ?')
  return stmt.get(spaceId)
}

export const getSpaceByInviteCode = (code) => {
  const stmt = db.prepare('SELECT * FROM spaces WHERE invite_code = ?')
  return stmt.get(code)
}

export const addSpaceMember = (spaceId, userId, role = 'member') => {
  const stmt = db.prepare('INSERT INTO space_members (space_id, user_id, role) VALUES (?, ?, ?)')
  return stmt.run(spaceId, userId, role)
}

export const getSpaceMember = (spaceId, userId) => {
  const stmt = db.prepare('SELECT * FROM space_members WHERE space_id = ? AND user_id = ?')
  return stmt.get(spaceId, userId)
}

export const getSpaceMembers = (spaceId) => {
  const stmt = db.prepare(`
    SELECT sm.*, u.username, u.avatar, u.status, u.custom_status
    FROM space_members sm
    JOIN users u ON sm.user_id = u.id
    WHERE sm.space_id = ?
    ORDER BY
      CASE sm.role
        WHEN 'owner' THEN 1
        WHEN 'admin' THEN 2
        WHEN 'member' THEN 3
      END,
      u.username ASC
  `)
  return stmt.all(spaceId)
}

export const updateMemberRole = (memberId, role) => {
  const stmt = db.prepare('UPDATE space_members SET role = ? WHERE id = ?')
  return stmt.run(role, memberId)
}

export const updateLastRead = (spaceId, userId, messageId) => {
  const stmt = db.prepare('UPDATE space_members SET last_read_message_id = ? WHERE space_id = ? AND user_id = ?')
  return stmt.run(messageId, spaceId, userId)
}

export const removeMember = (memberId) => {
  const stmt = db.prepare('DELETE FROM space_members WHERE id = ?')
  return stmt.run(memberId)
}

// ============ TEXT CHANNELS ============
export const createTextChannel = (spaceId, name) => {
  const stmt = db.prepare('INSERT INTO text_channels (space_id, name) VALUES (?, ?)')
  return stmt.run(spaceId, name)
}

export const getSpaceChannels = (spaceId) => {
  const stmt = db.prepare('SELECT * FROM text_channels WHERE space_id = ? ORDER BY created_at ASC')
  return stmt.all(spaceId)
}

export const getChannelById = (channelId) => {
  const stmt = db.prepare('SELECT * FROM text_channels WHERE id = ?')
  return stmt.get(channelId)
}

export const deleteTextChannel = (channelId) => {
  const stmt = db.prepare('DELETE FROM text_channels WHERE id = ?')
  return stmt.run(channelId)
}

// ============ VOICE CHANNELS ============
export const createVoiceChannel = (spaceId, name) => {
  const stmt = db.prepare('INSERT INTO voice_channels (space_id, name) VALUES (?, ?)')
  return stmt.run(spaceId, name)
}

export const getSpaceVoiceChannels = (spaceId) => {
  const stmt = db.prepare('SELECT * FROM voice_channels WHERE space_id = ? ORDER BY created_at ASC')
  return stmt.all(spaceId)
}

export const getVoiceChannelById = (channelId) => {
  const stmt = db.prepare('SELECT * FROM voice_channels WHERE id = ?')
  return stmt.get(channelId)
}

export const deleteVoiceChannel = (channelId) => {
  const stmt = db.prepare('DELETE FROM voice_channels WHERE id = ?')
  return stmt.run(channelId)
}

// ============ DIRECT CHATS ============
export const createOrGetDirectChat = (user1Id, user2Id) => {
  const [minId, maxId] = user1Id < user2Id ? [user1Id, user2Id] : [user2Id, user1Id]

  let stmt = db.prepare('SELECT * FROM direct_chats WHERE user1_id = ? AND user2_id = ?')
  let chat = stmt.get(minId, maxId)

  if (!chat) {
    stmt = db.prepare('INSERT INTO direct_chats (user1_id, user2_id) VALUES (?, ?)')
    const result = stmt.run(minId, maxId)
    chat = { id: result.lastInsertRowid, user1_id: minId, user2_id: maxId, user1_last_read: 0, user2_last_read: 0 }
  }

  return chat
}

export const getUserDirectChats = (userId) => {
  const stmt = db.prepare(`
    SELECT dc.*,
      CASE
        WHEN dc.user1_id = ? THEN u2.id
        ELSE u1.id
      END as other_user_id,
      CASE
        WHEN dc.user1_id = ? THEN u2.username
        ELSE u1.username
      END as other_username,
      CASE
        WHEN dc.user1_id = ? THEN u2.avatar
        ELSE u1.avatar
      END as other_avatar,
      CASE
        WHEN dc.user1_id = ? THEN u2.status
        ELSE u1.status
      END as other_status,
      (SELECT content FROM messages WHERE type = 'direct' AND target_id = dc.id ORDER BY created_at DESC LIMIT 1) as last_message,
      (SELECT id FROM messages WHERE type = 'direct' AND target_id = dc.id ORDER BY created_at DESC LIMIT 1) as last_message_id,
      (SELECT created_at FROM messages WHERE type = 'direct' AND target_id = dc.id ORDER BY created_at DESC LIMIT 1) as last_message_at,
      (SELECT COUNT(*) FROM messages WHERE type = 'direct' AND target_id = dc.id AND id >
        CASE WHEN dc.user1_id = ? THEN dc.user1_last_read ELSE dc.user2_last_read END) as unread_count
    FROM direct_chats dc
    JOIN users u1 ON dc.user1_id = u1.id
    JOIN users u2 ON dc.user2_id = u2.id
    WHERE dc.user1_id = ? OR dc.user2_id = ?
    ORDER BY last_message_at DESC
  `)
  return stmt.all(userId, userId, userId, userId, userId, userId, userId)
}

export const getDirectChatById = (chatId) => {
  const stmt = db.prepare('SELECT * FROM direct_chats WHERE id = ?')
  return stmt.get(chatId)
}

export const updateDMLastRead = (chatId, userId, messageId) => {
  const chat = getDirectChatById(chatId)
  const field = chat.user1_id === userId ? 'user1_last_read' : 'user2_last_read'
  const stmt = db.prepare(`UPDATE direct_chats SET ${field} = ? WHERE id = ?`)
  return stmt.run(messageId, chatId)
}

// ============ MESSAGES ============
export const createMessage = (type, targetId, userId, content) => {
  const stmt = db.prepare('INSERT INTO messages (type, target_id, user_id, content) VALUES (?, ?, ?, ?)')
  return stmt.run(type, targetId, userId, content)
}

export const getMessages = (type, targetId, limit = 50) => {
  const stmt = db.prepare(`
    SELECT m.*, u.username, u.avatar, u.status
    FROM messages m
    JOIN users u ON m.user_id = u.id
    WHERE m.type = ? AND m.target_id = ?
    ORDER BY m.created_at DESC
    LIMIT ?
  `)
  return stmt.all(type, targetId, limit).reverse()
}

export const searchMessages = (query, type, targetId) => {
  const stmt = db.prepare(`
    SELECT m.*, u.username, u.avatar
    FROM messages m
    JOIN users u ON m.user_id = u.id
    WHERE m.type = ? AND m.target_id = ? AND m.content LIKE ?
    ORDER BY m.created_at DESC
    LIMIT 50
  `)
  return stmt.all(type, targetId, `%${query}%`)
}

export const deleteMessage = (messageId, userId) => {
  const stmt = db.prepare('DELETE FROM messages WHERE id = ? AND user_id = ?')
  return stmt.run(messageId, userId)
}

// ============ REACTIONS ============
export const addReaction = (messageId, userId, emoji) => {
  const stmt = db.prepare('INSERT OR IGNORE INTO message_reactions (message_id, user_id, emoji) VALUES (?, ?, ?)')
  return stmt.run(messageId, userId, emoji)
}

export const removeReaction = (messageId, userId, emoji) => {
  const stmt = db.prepare('DELETE FROM message_reactions WHERE message_id = ? AND user_id = ? AND emoji = ?')
  return stmt.run(messageId, userId, emoji)
}

export const getMessageReactions = (messageId) => {
  const stmt = db.prepare(`
    SELECT emoji, COUNT(*) as count, GROUP_CONCAT(user_id) as user_ids
    FROM message_reactions
    WHERE message_id = ?
    GROUP BY emoji
  `)
  return stmt.all(messageId)
}

export default db
