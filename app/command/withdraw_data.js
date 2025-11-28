const axios = require('axios');
const appConfig = require('../config/app.config');
const db = require('../model');
const Transaction = db.transactions;

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

const handleWithdrawData = async (callbackQuery) => {
  console.log('handleWithdrawData called with callbackQuery:', JSON.stringify(callbackQuery, null, 2));
  try {
    // Get recent withdrawal transactions
    const recentWithdrawals = await db.transactions.findAll({
      where: { reference_type: 'withdrawal', status: 'completed' },
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    let text = `💰 Recent Withdrawal Data\n\n`;

    if (recentWithdrawals.length === 0) {
      text += `No withdrawal transactions found.`;
    } else {
      for (const tx of recentWithdrawals) {
        const amount = Math.abs(tx.amount);
        // Get user details
        const user = await db.users.findByPk(tx.userId);
        const userInfo = user ? `${user.username} (${user.email})` : `ID: ${tx.userId}`;

        text += `ID: <code>${tx.id}</code>\n`;
        text += `User: ${userInfo}\n`;
        text += `Amount: ${amount/100} USDT\n`;
        text += `Status: ${tx.status}\n`;
        text += `Date: ${tx.createdAt}\n\n`;
      }
    }

    // Summary stats
    const totalWithdrawAmount = await db.transactions.sum('amount', { where: { type: 'WITHDRAWAL', status: 'COMPLETED' } }) || 0;
    const pendingWithdrawAmount = await db.transactions.sum('amount', { where: { type: 'WITHDRAWAL', status: 'PENDING' } }) || 0;
    const totalWithdraw = Math.abs(totalWithdrawAmount/100);
    const pendingWithdraw = Math.abs(pendingWithdrawAmount/100);
    const pendingCount = await db.transactions.count({ where: { type: 'WITHDRAWAL', status: 'PENDING' } });

    text += `📊 Summary:\n`;
    text += `Total Completed: ${totalWithdraw} USDT\n`;
    text += `Pending: ${pendingWithdraw} USDT (${pendingCount} transactions)`;

    await axios.post(`https://api.telegram.org/bot${appConfig.telegramBotToken}/answerCallbackQuery`, {
      callback_query_id: callbackQuery.id,
      text: 'Loading withdraw data...'
    });
    await sendMessage(callbackQuery.message.chat.id, text);
  } catch (error) {
    console.error('Error in withdraw data:', error);
    await axios.post(`https://api.telegram.org/bot${appConfig.telegramBotToken}/answerCallbackQuery`, {
      callback_query_id: callbackQuery.id,
      text: 'Error loading withdraw data'
    });
    await sendMessage(callbackQuery.message.chat.id, 'Error loading withdrawal data.');
  }
};

module.exports = {
  handleWithdrawData
};
