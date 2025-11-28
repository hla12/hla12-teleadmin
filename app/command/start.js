const axios = require('axios');
const appConfig = require('../config/app.config');

const sendMessage = async (chatId, text, replyMarkup = null) => {
  try {
    const payload = {
      chat_id: chatId,
      text: text
    };
    if (replyMarkup) {
      payload.reply_markup = replyMarkup;
    }
    await axios.post(`https://api.telegram.org/bot${appConfig.telegramBotToken}/sendMessage`, payload);
  } catch (error) {
    console.error('Error sending message:', error.response?.data || error.message);
  }
};

const handleStart = async (chatId) => {
  const text = 'Welcome to the Admin Panel Bot! Choose an option:';
  const replyMarkup = {
    inline_keyboard: [
      [
        { text: '📊 Dashboard', callback_data: 'menu_dashboard' },
        { text: '💰 Withdraw Data', callback_data: 'menu_withdraw_data' }
      ]
    ]
  };
  await sendMessage(chatId, text, replyMarkup);
};

module.exports = {
  handleStart
};