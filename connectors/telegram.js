const TelegramBot = require('node-telegram-bot-api')

module.exports = function createTelegramConnector (botToken, chatId) {
  const bot = new TelegramBot(botToken, { polling: true })

  let eventHandler = () => {}

  bot.onText(/(.*)/, ({ from, text }) => {
    if (from.id === chatId) {
      eventHandler('chat-message', { message: text })
    }
  })

  return {
    setEventHandler: (handler) => { eventHandler = handler },
    receiveUserEvent: (event, payload) => {
      const { username } = payload
      switch (event) {
        case 'chat-message': return bot.sendMessage(chatId, `${username} says: ${payload.message}`)
        case 'username-changed': return bot.sendMessage(chatId, `${username} is now called ${payload.to}`)
        case 'user-connected': return console.log(`${username} connected`)
        case 'user-disconnected': return console.log(`${username} disconnected`)
        default: console.error('Unhandled event')
      }
    }
  }
}
