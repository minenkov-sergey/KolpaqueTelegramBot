const TelegramBot = require('node-telegram-bot-api')
const config = require('config')
const { default: Axios } = require('axios')

const BOT_TOKEN = config.get('token')
const bot = new TelegramBot(BOT_TOKEN, { polling: true })
const chat_id = config.get('chatId')
const URL = config.get('url')

//Переменные хранящие статус "было ли отправлено сообщение о статусе канала в чат"
let botSendedStatusKino = false
let botSendedStatusMain = false

//Проверка активности каналов через заданный интервал
setInterval(() => {
    (Axios.get(`${URL}/channels/`)
        .then((res => {
            if (res.data.live[0].apps.length > 0) { //если хотябы 1 канал онлайн
                data = res.data.live[0].apps[0].channels
                dataMain = data[0]
                dataKino = data[1]

                if (dataMain && !botSendedStatusMain) {
                    sendStatus(dataMain)
                    console.log('Main is online')
                } else if (!dataMain) {
                    botSendedStatusMain = false
                }
                if (dataKino && !botSendedStatusKino) {
                    sendStatus(dataKino)
                    console.log('Kino is online')
                } else if (!dataKino) {
                    botSendedStatusKino = false
                }
            } else { //если все каналы оффлайн
                botSendedStatusMain = false
                botSendedStatusKino = false
            }
        }))
        .catch((error) => { console.log(error) })
    )
}, 10000)

//Функция отправки статуса поднявшегося канала.
const sendStatus = async (data) => {
    let streamerName = await getStreamerName(data.publisher.userId)
    sendMessage(data, streamerName)
    console.log(`On channel: ${data.channel}, streamer: ${streamerName}`)
}

//Функция получения имени стримера
const getStreamerName = async (userId) => {
    let name = ''
    await Axios.get(`${URL}/users/${userId}`)
        .then((res => {
            name = res.data.user.name
        }))
    return name
}

//Функция отправки статуса в чат в зависимости от активного канала.
const sendMessage = (data, streamerName) => {
    if (data.channel === 'main') {
        bot.sendPhoto(chat_id, './assets/MainOnline.png', { caption: `Стримит: ${streamerName}` });
        botSendedStatusMain = true
    }
    if (data.channel === 'kino') {
        bot.sendPhoto(chat_id, './assets/KinoOnline.png', { caption: `Показывает: ${streamerName}` });
        botSendedStatusKino = true
    }
}

//Реакция бота на ключевые слова в чате
bot.on('text', (msg) => {
    let userText = msg.text.toLowerCase()

    if (userText.includes('кабан') && userText.includes('стрим')) {
        if (botSendedStatusMain) {
            bot.sendMessage(chat_id, `На мэйне есть стрим`)
        }
        if (botSendedStatusKino) {
            bot.sendMessage(chat_id, `Есть кинчик`)
        }
        if (!botSendedStatusMain && !botSendedStatusKino) {
            bot.sendMessage(chat_id, `Нету стримов`)
        }
    }
    if (userText.includes('кабан') && userText.includes('арма') && userText.includes('когда')) {
        bot.sendMessage(chat_id, `соооооооон`)
    }

    if (userText.includes('сколько') && userText.includes('истребителей')) {
        bot.sendMessage(chat_id, `50 истребителей зеро, 40 торпедоносцев и 81 пикирующий бомбардировщик`)
    }
    if (userText.includes('какие') && userText.includes('корабли')) {
        bot.sendMessage(chat_id, `Аризона, Вест-Вирджиния, Оклахома и Мэрилэнд`)
        bot.sendMessage(chat_id, `Это КЛАССИКА блять ЭТО ЗНАТЬ НАДО!!!`)
    }
    if (userText === 'да') {
        bot.sendMessage(chat_id, `*хрю* ПИЗДА *хрю*`)
    }
})


