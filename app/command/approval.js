const axios = require('axios');
const appConfig = require('../config/app.config');
const db = require('../model');
const withdrawalLib = require('../lib/withdrawal');

const handleApprove = async (txid, callbackQuery) => {
  try {
    await db.transactions.update({ status: 'waiting' }, { where: { id: txid } });

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
    await db.transactions.update({ status: 'failed' }, { where: { id: txid } });

    // Refund the coin back to user wallet
    const transaction = await db.transactions.findByPk(txid);
    if (transaction) {
      const userWallet = await db.user_wallets.findOne({
        where: { userId: transaction.userId }
      });
      if (userWallet) {
        userWallet.increment('coin', { by: transaction.amount });
      }
    }

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
