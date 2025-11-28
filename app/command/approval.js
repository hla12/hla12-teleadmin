const axios = require('axios');
const appConfig = require('../config/app.config');
const db = require('../model');
const withdrawalLib = require('../lib/withdrawal');

const handleApprove = async (txid, callbackQuery) => {
  try {
    await db.transactions.update({ status: 'COMPLETED' }, { where: { id: txid } });

    // Process the withdrawal
    const transaction = await db.transactions.findByPk(txid);
    if (transaction) {
      await withdrawalLib.processUSDTWithdrawal(txid);
    }

    await axios.post(`https://api.telegram.org/bot${appConfig.telegramBotToken}/answerCallbackQuery`, {
      callback_query_id: callbackQuery.id,
      text: 'Transaction approved'
    });
    const approver = callbackQuery.from.username || callbackQuery.from.first_name || 'Unknown';
    await axios.post(`https://api.telegram.org/bot${appConfig.telegramBotToken}/editMessageText`, {
      chat_id: callbackQuery.message.chat.id,
      message_id: callbackQuery.message.message_id,
      text: callbackQuery.message.text + `\n\n✅ Approved by @${approver}`,
      parse_mode: 'HTML'
    });
  } catch (error) {
    console.error('Error approving transaction:', error);
  }
};

const handleReject = async (txid, callbackQuery) => {
  try {
    await db.transactions.update({ status: 'processing' }, { where: { id: txid } });
    await axios.post(`https://api.telegram.org/bot${appConfig.telegramBotToken}/answerCallbackQuery`, {
      callback_query_id: callbackQuery.id,
      text: 'Transaction rejected'
    });
    const rejector = callbackQuery.from.username || callbackQuery.from.first_name || 'Unknown';
    await axios.post(`https://api.telegram.org/bot${appConfig.telegramBotToken}/editMessageText`, {
      chat_id: callbackQuery.message.chat.id,
      message_id: callbackQuery.message.message_id,
      text: callbackQuery.message.text + `\n\n❌ Rejected by @${rejector}`,
      parse_mode: 'HTML'
    });
  } catch (error) {
    console.error('Error rejecting transaction:', error);
  }
};

module.exports = {
  handleApprove,
  handleReject
};
