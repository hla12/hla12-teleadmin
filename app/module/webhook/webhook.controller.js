const axios = require('axios');
const appConfig = require('../../config/app.config');
const db = require('../../model');
const approval = require('../../command/approval');
const startCmd = require('../../command/start');
const menuCmd = require('../../command/menu');
const withdrawCmd = require('../../command/withdraw');
const dashboardCmd = require('../../command/dashboard');
const withdrawDataCmd = require('../../command/withdraw_data');
const checkCmd = require('../../command/check');
const accCmd = require('../../command/acc');

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

const handleWebhook = async (req, res) => {
  const update = req.body;

  if (update.message) {
    const message = update.message;
    const chatId = message.chat.id;
    const text = message.text;

    // Check if message is from the configured group
    if (chatId !== parseInt(appConfig.telegramGroupId)) {
      await sendMessage(chatId, 'This bot only responds in the designated group.');
      return res.sendStatus(200);
    }

    if (text) {
      switch (true) {
        case text.startsWith('/start'):
          await startCmd.handleStart(chatId);
          break;
        case text.startsWith('/menu'):
          await menuCmd.handleMenu(chatId);
          break;
        case text.startsWith('/withdraw'):
          await withdrawCmd.handleWithdraw(chatId);
          break;
        case text.startsWith('/check'):
          await checkCmd.handleCheck(chatId, text);
          break;
        case text.startsWith('/acc'):
          await accCmd.handleAcc(chatId, text);
          break;
        default:
          // Forward to group or echo
	console.log('wow');
         // await sendMessage(appConfig.telegramGroupId, `Message from ${message.from.username || message.from.first_name}: ${text}`);
      }
    }
  }

  if (update.callback_query) {
    const callbackQuery = update.callback_query;
    const callbackData = callbackQuery.data;

    console.log('Received callback_data:', callbackData);

    switch (callbackData) {
      case 'menu_dashboard':
        console.log('Handling dashboard callback');
        await dashboardCmd.handleDashboard(callbackQuery);
        break;
      case 'menu_withdraw_data':
        console.log('Handling withdraw data callback');
        await withdrawDataCmd.handleWithdrawData(callbackQuery);
        break;
      default:
        if (callbackData.startsWith('approve_') || callbackData.startsWith('reject_')) {
          const parts = callbackData.split('_');
          const action = parts[0];
          const txid = parts.slice(1).join('_');
          switch (action) {
            case 'approve':
              await approval.handleApprove(txid, callbackQuery);
              break;
            case 'reject':
              await approval.handleReject(txid, callbackQuery);
              break;
            default:
              console.log('Unknown callback action:', action);
          }
        } else {
          console.log('Unknown callback data:', callbackData);
        }
    }
  }

  res.sendStatus(200);
};

module.exports = {
  handleWebhook
};
