const io = require('socket.io-client')

const once = require('./lib/once')

const commandCss = 'background-color: #eeeeee; border-radius: 3px; padding: 2px 5px; margin-left: 10px;'

module.exports = function createChat (opts = {}) {
  const {
    saveUsername = (username) => { window.localStorage.setItem('chat-username', username) },
    retrieveUsername = () => { return window.localStorage.getItem('chat-username') }
  } = opts
  const socket = io()
  socket.on('connect', async () => {
    socket.on('client-connected', once(({ username }) => {
      console.log(`Connected as ${username}`)
      console.log(``)
      console.log(`Hey, looks like you found the chatroom!`)
      console.log(`Here's a rundown of how this works:`)
      console.log(`%cu('ricky-rowling')`, commandCss, `- choose a username, let me know who you are`)
      console.log(`%cc('Oh hi Mark!')`, commandCss, `- join in on the convo!`)

      socket.on('chat-message', ({ username, message }) => {
        console.log(`${username}: ${message}`)
      })

      socket.on('username-changed', ({ username, to }) => {
        console.log(`${username} will now be known as ${to}`)
      })

      socket.on('change-username-success', ({ username }) => {
        saveUsername(username)
      })

      socket.on('change-username-failed', ({ reason }) => {
        console.log(`Cannot change your username because ${reason}`)
      })

      socket.on('user-connected', ({ username }) => {
        console.log(`${username} has entered the building`)
      })

      socket.on('user-disconnected', ({ username }) => {
        console.log(`${username} has left the building`)
      })

      window.c = (message) => { socket.emit('chat-message', { message }) }
      window.u = (requestedUsername) => {
        socket.emit('change-username', { requestedUsername })
        return `One sec...`
      }
    }))

    socket.emit('connect-client', retrieveUsername())
  })
}
