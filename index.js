const TelegramApi = require('node-telegram-bot-api')
const token = '5914232324:AAFW4-xaFwMN7vpm2pra9NLSouTNpynskAo'
const {createClient} = require('@supabase/supabase-js')

const bot = new TelegramApi(token, {polling: true})
const supabase = createClient('https://sehvxcrcyusvcijeygjo.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlaHZ4Y3JjeXVzdmNpamV5Z2pvIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzM0NjIxMTYsImV4cCI6MTk4OTAzODExNn0.SVntrM0LlCi4Euj2PL8Oxv3woztxbUDJC9Vcazg7NkY')

const saveData = async (userObject) => {
  try {
    Object.values(userObject).forEach(async user => {
      
      const data = [...user.values()][0]
      if (userObject === allUsers) {
        
        const response = await supabase.from('users').insert( data ) 
        console.log(response.statusText + 'if1')
      } 
      if (userObject === allUrists) {
        console.log(user.keys().next().value)
        const urist = user.keys().next().value
        const response = await supabase.from('urists').select('*').eq('username', urist)
        // console.log(response)
        if (response.data.length === 0) {
           await supabase.from('urists').insert( data ) 
          // console.log(' new urist added')
        }
        // console.log('noone added')
      }
    })
  } catch (e) {
    console.log(e + 'error')
  }
}

// const fetchData = async () => {
//   try {
//     const response = await supabase.from('users').select('*')
//     // console.log(response.data)
//   } catch (error) {
//     console.log(error)
//   }
// }

// fetchData()


const urists =  new Set(['Levonn'])
const allUrists = {}
const allUsers = {}

const addUrist = (username, chatId, userName) => {
  const uristObject = {
    username: username,
    chatId: chatId,
    userName: userName
  }

  const uristDb = new Map
  uristDb.set(username, uristObject)
  
  allUrists[username] = uristDb
  
  saveData(allUrists)
}

const addUserData = (msg, chatId) => {
  console.log(msg)
  const user = msg.from
  const username = user.username
  // const chatId = msg.chat.id 
  const userName = user.first_name + ' ' + (msg.from.last_name || '')
  const question = msg.data || msg.text
  const userObject = {
    username: username,
    chatId: chatId,
    userName: userName,
    question: question
  }

  const userDb = new Map
  userDb.set(username, userObject)

  allUsers[username] = userDb
  saveData(allUsers)
}

const checkForNewData = async () => {
  try {
    const response = await supabase.from('users').select('*').eq('distributed', 'false')
    if(response.data.length > 0){
        response.data.forEach(async (row) => {
            bot.sendMessage(urists.Levonn, `New row found with column_name: ${row.distributed}`)
        });
      }
   } catch (e) {
    console.log(e)
  }
}
// checkForNewData()
  


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

bot.onText(/\/start/, msg => {
  const text = msg.text
  const chatId = msg.chat.id
  const user = msg.from.username
  const userName = msg.from.first_name + ' ' + (msg.from.last_name || '')
  if ( urists.has(user)) {
    addUrist(user, chatId, userName)
    bot.sendMessage(chatId, 'hello, here list of tasks')
    
  } else {
     bot.sendMessage(chatId, 'hello, choose your problem and we\'ll find somoene to help you', replyOptions)
   
  }
  
  
})

bot.on('callback_query',  msg => {
  console.log(msg.data)
  const chatId = msg.message.chat.id
  if (/Other issue/.test(msg.data)) {
    bot.sendMessage(chatId, 'Please describe your problem')
  } else {
    addUserData(msg, chatId)
     bot.sendMessage(chatId, `You selected ${msg.data}. Help is on the way!`)
  }
   bot.answerCallbackQuery(msg.id)
}) 

bot.onText(/^(?!\/start).*$/, msg => {
  console.log(msg)
  const chatId = msg.chat.id
  bot.sendMessage(chatId, `We'll help you with ${msg.text} as soon as posible`)
  addUserData(msg, chatId)
}) 