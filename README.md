# console-chat

Run a chat room in the console

```js
// server.js
const http = require('http')
const createChatServer = require('console-chat/server')
const createTelegramConnector = require('console-chat/connectors/telegram')

// Connect up telegram to see and respond to messages
const telegramConnector = creatTelegramConnector(process.env.BOT_TOKEN, process.env.CHAT_ID)

const server = http.Server()
createChatServer(server, {
  hq: telegramConnector,
  name: 'tommy' // Admin username, messages from telegram will be sent under this name
})

server.listen(3000)
```

```js
// client.js
const createChatClient = require('console-chat/client')
createChatClient()
```

## Linking to Telegram

The provided Telegram connector allows you to receive and send messages to the chatroom from your Telegram account.

The connector works through the Telegram Bot API.

First you will need to [create a bot](https://core.telegram.org/bots#3-how-do-i-create-a-bot). Then start a conversation with the bot via your account (security reasons, bots can't initiate chats). Then you just need to provide the BOT_TOKEN and CHAT_ID to the connector constructor.
