const TelegramApi = require('node-telegram-bot-api')
const token = '5914232324:AAFW4-xaFwMN7vpm2pra9NLSouTNpynskAo'
const {createClient} = require('@supabase/supabase-js')
const moment = require('moment')

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
  checkForNewData()
}

const checkForNewData = async () => {
  try {
    const response = await supabase.from('users').select('*').eq('distributed', 'false')
    if(response.data.length > 0){
        response.data.forEach(async (row) => {
          // console.log(urists.values().next().value)
          console.log(row)
          const executor = await supabase.from('urists').select('*').eq('username', urists.values().next().value)

          const chatId = row.chatId
          const date = moment(row.created_at).format("YYYY-MM-DD HH:mm")
          console.log(chatId)
          const taskManagerOptions = {
            reply_markup: JSON.stringify({
              inline_keyboard: [
                [{text: 'take this task',  callback_data: 'task taken'}]
              ]
            })
          }
          const assignmentOption = {
            reply_markup: JSON.stringify({
              inline_keyboard: [
                [{text: 'start chat', url: `https://t.me/${row.username}`}]
              ]
            })
          }
          // url: `https://t.me/${row.username}`,
          // https://api.telegram.org/bot${token}?start?chat_id=${chatId}
          bot.sendMessage(executor.data[0].chatId, `${date} \n${row.username} \n${row.userName} \n${row.question}`, taskManagerOptions)

          bot.on('callback_query',  async msg => {
            if (/task taken/.test(msg.data)) {
              console.log('taken')
              bot.sendMessage(row.chatId, `For your request ${row.question} has been assigned ${executor.data[0].userName}. He will contact you shortly`)
              bot.sendMessage(executor.data[0].chatId, `To start chat with ${row.userName} click the link`, assignmentOption)
              const updateDistribution = await supabase.from('users').update({'distriburted': 'true'}).eq('id', row.id)
              console.log(row)
              }
               bot.answerCallbackQuery(msg.id)
            }) 
        });
      }
   } catch (e) {
    console.log(e)
  }
} 

  


const replyOptions = {
  reply_markup: JSON.stringify({
    inline_keyboard: [
      [{text: 'Help with docs', callback_data: 'Help with docs'}],
      [{text: 'Representation in court', callback_data: 'Representation in court'}],
      [{text: 'Free consultation', callback_data: 'Free consultation'}],
      [{text: 'Other issue', callback_data: 'Other issue'}],
      [{text: 'Call me', callback_data: 'a call'}]  
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
    checkForNewData()
  } else {
     bot.sendMessage(chatId, 'hello, choose your problem and we\'ll find somoene to help you', replyOptions)
   
  }
  
  
})

bot.on('callback_query',  msg => {
  console.log(msg.data)
  const chatId = msg.message.chat.id
  if (/Other issue/.test(msg.data)) {
    bot.sendMessage(chatId, 'Please describe your problem')
  } 
  if (/task taken/.test(msg.data)) {
    return
  } else {
    addUserData(msg, chatId)
     bot.sendMessage(chatId, `You selected ${msg.data}. Help is on the way!`)
  }
   bot.answerCallbackQuery(msg.id)
}) 

bot.onText(/^(?!\/start).*$/, msg => {
  console.log(msg)
  const chatId = msg.chat.id
  const user = msg.from.username
  if (!urists.has(user)) {
    bot.sendMessage(chatId, `We'll help you with ${msg.text} as soon as posible`)
    addUserData(msg, chatId)
  }
}) 