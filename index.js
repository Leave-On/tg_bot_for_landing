const TelegramApi = require('node-telegram-bot-api')
const token = '5914232324:AAFW4-xaFwMN7vpm2pra9NLSouTNpynskAo'

const bot = new TelegramApi(token, {polling: true})

const urists =  new Set(['Levonn'])
const clients = []
class Client {
  constructor(username, question, date) {
    this.username = username
    this.question = {question: question, date: date}
  }
}

const test = new Client('levon', 'what', 'now')

const addUser = (username, question, date) => {
  const clientId = 1
  const newClient = new Client(username, question, date)
  clients.push(newClient)
  console.log(clients)
}



const replyOptions = {
  reply_markup: JSON.stringify({
    inline_keyboard: [
      [{text: 'Help with docs', callback_data: 'Help with docs'}],
      [{text: 'Representation in court', callback_data: 'Representation in court'}],
      [{text: 'Free consultation', callback_data: 'Free consultation'}],
      [{text: 'Other issue', callback_data: 'Other issue'}]
    ]
  })
}

bot.on('message', async msg => {
  const text = msg.text
  const chatId = msg.chat.id
  const user = msg.from.username
  if (!urists.has(user)) {
   await bot.sendMessage(chatId, 'hello, here list of tasks')
  } else {
   await  bot.sendMessage(chatId, 'hello, choose your problem and we\'ll find somoene to help you', replyOptions)
   
  }
  
})

bot.on('callback_query', async msg => {
  
  const data = msg.data
  const chatId = msg.message.chat.id
  clients.username = msg.from.username
  addUser(msg.from.username, data, 'now')
   await bot.sendMessage(chatId, 'Good')
})