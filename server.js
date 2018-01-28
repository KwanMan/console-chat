
const createIO = require('socket.io')
const defaultsDeep = require('lodash/defaultsDeep')

const rateLimit = require('./lib/rateLimit')

const defaultOpts = {
  hq: {
    receiveMessage: () => {},
    addBroadcastHandler: () => {}
  },
  generateUsername: () => `anon-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
  name: 'hq',
  maxMessagesPerSecond: 10,
  messages: {
    userConnected: (user) => `${user} has entered the building.`,
    userDisconnected: (user) => `${user} has left the building.`,
    userChangedUsername: (from, to) => `${from} will now be known as ${to}`
  }
}

module.exports = function createChatServer (httpServer, opts) {
  const {
    name,
    hq,
    generateUsername,
    maxMessagesPerSecond
  } = defaultsDeep(opts, defaultOpts)

  const io = createIO(httpServer)

  const connectedUsers = new Set([ name ])

  hq.setEventHandler((event, payload) => {
    if (event !== 'chat-message') return
    io.sockets.emit('chat-message', { username: name, message: payload.message })
  })

  io.on('connection', (socket) => {
    let username = generateUsername()

    socket.on('connect-client', (requestedUsername) => {
      if (requestedUsername && !connectedUsers.has(requestedUsername)) {
        connectedUsers.add(requestedUsername)
        username = requestedUsername
      }
      socket.emit('client-connected', { username })
      socket.broadcast.emit('user-connected', { username })
      hq.receiveUserEvent('user-connected', { username })
    })

    socket.on('disconnect', () => {
      io.sockets.emit('user-disconnected', { username })
      hq.receiveUserEvent('user-disconnected', { username })
      connectedUsers.delete(username)
    })

    socket.on('chat-message', rateLimit({
      maxCalls: maxMessagesPerSecond,
      perMs: 1000,
      fn: ({ message }) => {
        io.sockets.emit('chat-message', { username, message })
        hq.receiveUserEvent('chat-message', { username, message })
      },
      onExceed: () => { socket.emit('chat-update', 'Sorry, you can only send 10 messages per second') }
    }))

    socket.on('change-username', ({ requestedUsername }) => {
      if (connectedUsers.has(requestedUsername)) {
        socket.emit('change-username-failed', { reason: `${requestedUsername} is already connected` })
      } else {
        connectedUsers.delete(username)
        connectedUsers.add(requestedUsername)
        socket.emit('change-username-success', { username: requestedUsername })
        io.sockets.emit('username-changed', { username, to: requestedUsername })
        hq.receiveUserEvent('username-changed', { username, to: requestedUsername })
        username = requestedUsername
      }
    })
  })
}
