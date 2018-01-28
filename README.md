# console-chat

```js
// server.js
const http = require('http')
const createChatServer = require('console-chat/server')
const createTelegramConnector = require('console-chat/connectors/telegram')

const server = http.Server()
const telegramConnector = creatTelegramConnector(process.env.BOT_TOKEN, process.env.CHAT_ID)

createChatServer(server, {
  hq: telegramConnector,
  name: 'tommy'
})

server.listen(3000)
```

```js
// client.js
const createChatClient = require('console-chat/client')
createChatClient()
```
