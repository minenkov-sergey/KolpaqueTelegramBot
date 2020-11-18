const TelegramBot = require('node-telegram-bot-api')
const config = require ('config')
const { default: Axios } = require('axios')

const BOT_TOKEN = config.get('token')
const bot = new TelegramBot(BOT_TOKEN, { polling: true })
const chat_id = config.get('chatId')
const URL = config.get('url')

let data = {}
let botSendedStatus = false

setInterval(() => {
    (Axios.get(URL)
        .then((response => {
            if (response.data.nms.live) {
                data = response.data.nms.live
                if (!botSendedStatus) {
                    sendMessage(data)
                }
                console.log('Stream is online')
            } else {
                if (botSendedStatus) {
                    bot.sendMessage(chat_id, `Stream ended`)
                    botSendedStatus = false

                    console.log('Stream ended')
                }
                console.log('Stream is offline')
            }
        }))
        .catch((response) => { console.log(`error: ${response}`) })
    )
}, 10000)

const sendMessage = (data) => {
    if (data.kino && !botSendedStatus) {
        bot.sendMessage(chat_id, `Stream KINO is Online \nStreamer: ${data.kino.publisher.userId}`)
        botSendedStatus = true

        console.log(`Stream KINO is Online`)
    } else if (data.main && !botSendedStatus) {
        bot.sendMessage(chat_id, `Stream MAIN is Online \nStreamer: ${data.main.publisher.userId}`)
        botSendedStatus = true

        console.log(`Stream MAIN is Online`)
    }
}

bot.on('text', (msg) => {
    let userText = msg.text
    if(userText.includes(('кабан'||'кабанчик'||'кабаняра'||'@Kabanch_bot')) && userText.includes(('стрим'||'стримы'||'стримам')) ) {
        if (botSendedStatus) {
            bot.sendMessage(chat_id, `Stream is Online, check KLPQ Client`)
        } else {
            bot.sendMessage(chat_id, `Stream is Offline`)
        }
    }
})