const axios = require('axios');
const appConfig = require('../config/app.config');

const sendMessage = async (chatId, text) => {
  try {
    await axios.post(`https://api.telegram.org/bot${appConfig.telegramBotToken}/sendMessage`, {
      chat_id: chatId,
      text: text
    });
  } catch (error) {
    console.error('Error sending message:', error.response?.data || error.message);
  }
};

const handleWithdraw = async (chatId) => {
  await sendMessage(chatId, 'Withdraw functionality not implemented yet.');
};

module.exports = {
  handleWithdraw
};
