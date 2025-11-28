const axios = require('axios');
const appConfig = require('../config/app.config');
const db = require('../model');

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

const handleCheck = async (chatId, text) => {
  const parts = text.split(' ');
  if (parts.length < 2) {
    await sendMessage(chatId, 'Usage: /check {transaction_id}');
    return;
  }

  const transactionId = parts[1];

  try {
    const transaction = await db.transactions.findByPk(transactionId);
    if (!transaction) {
      await sendMessage(chatId, `Transaction with ID <code>${transactionId}</code> not found.`);
      return;
    }

    // Check if transaction type is DEPOSIT or WITHDRAWAL
    if (transaction.reference_type !== 'deposit' && transaction.reference_type !== 'withdrawal') {
      await sendMessage(chatId, `Invalid transaction type. Only DEPOSIT and WITHDRAWAL transactions can be checked.`);
      return;
    }

    // Get user details
    const user = await db.users.findByPk(transaction.userId);

    let messageText = `🔍 Transaction Details\n\n`;
    messageText += `📋 ID: <code>${transaction.id}</code>\n`;
    messageText += `👤 User: ${user ? `${user.username} (${user.email})` : 'Unknown'}\n`;
    messageText += `🔗 Reference ID: ${transaction.reference_id}\n`;
    messageText += `📊 Type: ${transaction.type}\n`;
    messageText += `🔖 Reference Type: ${transaction.reference_type || 'N/A'}\n`;
    messageText += `💰 Amount: ${Math.abs(transaction.amount)}\n`;
    messageText += `📍 Status: ${transaction.status}\n`;
    messageText += `⏰ Created: ${transaction.createdAt}\n`;
    messageText += `🔄 Updated: ${transaction.updatedAt}\n\n`;

    if (transaction.additional_info) {
      try {
        const additionalInfo = JSON.parse(transaction.additional_info);
        messageText += `📋 Additional Info:\n`;
        for (const [key, value] of Object.entries(additionalInfo)) {
          if (key === 'destination_address' && transaction.type === 'WITHDRAWAL') {
            messageText += `${key}: <a href="https://bscscan.com/address/${value}">${value}</a>\n`;
          } else {
            messageText += `${key}: <code>${value}</code>\n`;
          }
        }
      } catch (e) {
        messageText += `📋 Additional Info: <code>${transaction.additional_info}</code>\n`;
      }
    }

    await sendMessage(chatId, messageText);
  } catch (error) {
    console.error('Error checking transaction:', error);
    await sendMessage(chatId, 'Error retrieving transaction details.');
  }
};

module.exports = {
  handleCheck
};