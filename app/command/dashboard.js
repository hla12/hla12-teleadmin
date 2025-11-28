const axios = require('axios');
const appConfig = require('../config/app.config');
const db = require('../model');

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

const handleDashboard = async (callbackQuery) => {
  console.log('handleDashboard called with callbackQuery:', JSON.stringify(callbackQuery, null, 2));
  try {
    // Calculate totals using Sequelize functions
    const totalDeposit = await db.transactions.sum('amount', { where: { reference_type: 'deposit', status: 'completed' } }) || 0;
    const totalWithdrawAmount = await db.transactions.sum('amount', { where: { reference_type: 'withdrawal', status: 'completed' } }) || 0;
    const pendingWithdrawAmount = await db.transactions.sum('amount', { where: { reference_type: 'withdrawal', status: 'pending' } }) || 0;

    // Since withdrawal amounts are negative, we take absolute value for display
    const totalWithdraw = Math.abs(totalWithdrawAmount/100);
    const pendingWithdraw = Math.abs(pendingWithdrawAmount/100);
    const totalDepositAbs = Math.abs(totalDeposit/100);

    // Count transactions
    const totalUsers = await db.users.count();
    const pendingWithdrawCount = await db.transactions.count({ where: { reference_type: 'withdrawal', status: 'pending' } });

    const text = `📊 Dashboard\n\n👥 Total Users: ${totalUsers}\n💰 Total Deposits: ${totalDepositAbs} USDT\n💸 Total Withdrawals: ${totalWithdraw} USDT\n⏳ Pending Withdrawals: ${pendingWithdraw} USDT (${pendingWithdrawCount} transactions)`;
    await axios.post(`https://api.telegram.org/bot${appConfig.telegramBotToken}/answerCallbackQuery`, {
      callback_query_id: callbackQuery.id,
      text: 'Loading dashboard...'
    });
    await sendMessage(callbackQuery.message.chat.id, text);
  } catch (error) {
    console.error('Error in dashboard:', error);
    await axios.post(`https://api.telegram.org/bot${appConfig.telegramBotToken}/answerCallbackQuery`, {
      callback_query_id: callbackQuery.id,
      text: 'Error loading dashboard'
    });
    await sendMessage(callbackQuery.message.chat.id, 'Error loading dashboard data.');
  }
};

module.exports = {
  handleDashboard
};
