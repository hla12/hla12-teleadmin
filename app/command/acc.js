const axios = require('axios');
const appConfig = require('../config/app.config');
const db = require('../model');
const withdrawalLib = require('../lib/withdrawal');

const sendMessage = async (chatId, text, replyMarkup = null) => {
  try {
    const payload = {
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML'
    };
    if (replyMarkup) {
      payload.reply_markup = replyMarkup;
    }
    await axios.post(`https://api.telegram.org/bot${appConfig.telegramBotToken}/sendMessage`, payload);
  } catch (error) {
    console.error('Error sending message:', error.response?.data || error.message);
  }
};

const handleAcc = async (chatId, text) => {
  const parts = text.split(' ');
  if (parts.length < 2) {
    await sendMessage(chatId, 'Usage: /acc {transaction_id}');
    return;
  }

  const transactionId = parts[1];

  try {
    const transaction = await db.transactions.findByPk(transactionId);
    if (!transaction) {
      await sendMessage(chatId, `Transaction with ID <code>${transactionId}</code> not found.`);
      return;
    }

    // Check if transaction type is WITHDRAWAL
    if (transaction.reference_type !== 'withdrawal') {
      await sendMessage(chatId, `Invalid transaction type. Only WITHDRAWAL transactions can be processed with /acc.`);
      return;
    }

    // Check if transaction is already completed
    if (transaction.status === 'COMPLETED') {
      await sendMessage(chatId, `Transaction <code>${transactionId}</code> is already completed.`);
      return;
    }

    await sendMessage(chatId, `🔄 Processing withdrawal for transaction <code>${transactionId}</code>...`);

    // Process the withdrawal
    const metadata = JSON.parse(transaction.metadata || '{}');
    if (metadata.withdrawal_type === 'crypto') {
      await withdrawalLib.processUSDTWithdrawal(transactionId);
      await sendMessage(chatId, `✅ USDT withdrawal processed for transaction <code>${transactionId}</code>`);
    } else if (metadata.withdrawal_type === 'local_currency') {
      try {
        const payoutResult = await withdrawalLib.processLocalWithdrawal(transactionId);
        let successMessage = `✅ Local currency withdrawal processed for transaction <code>${transactionId}</code>\n\n`;
        successMessage += `📋 Xendit Response:\n<pre>${JSON.stringify(payoutResult, null, 2)}</pre>`;
        await sendMessage(chatId, successMessage);
      } catch (error) {
        // Send Xendit error response
        let errorMessage = `❌ Xendit Payout Error for transaction <code>${transactionId}</code>:\n\n`;
        if (error.response?.data) {
          errorMessage += `<pre>${JSON.stringify(error.response.data, null, 2)}</pre>`;
        } else {
          errorMessage += `<pre>${error.message}</pre>`;
        }
        await sendMessage(chatId, errorMessage);
      }
    } else {
      await sendMessage(chatId, `❌ Unknown withdrawal type for transaction <code>${transactionId}</code>`);
    }

  } catch (error) {
    console.error('Error in /acc command:', error);
    await sendMessage(chatId, 'Error processing transaction.');
  }
};

module.exports = {
  handleAcc
};