import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' })
}

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

export const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }

  const decoded = verifyToken(token)
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid token' })
  }

  req.userId = decoded.userId
  next()
}

export const authenticateSocket = (socket, next) => {
  const token = socket.handshake.auth.token

  if (!token) {
    return next(new Error('Authentication error'))
  }

  const decoded = verifyToken(token)
  if (!decoded) {
    return next(new Error('Invalid token'))
  }

  socket.userId = decoded.userId
  next()
}
