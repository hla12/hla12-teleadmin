const axios = require('axios');
const appConfig = require('../../config/app.config');
const db = require('../../model');

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

const handleWithdraw = async (req, res) => {
  console.log('Withdraw endpoint hit - Request:', {
    headers: req.headers,
    body: req.body,
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString()
  });

  try {
    const { unique_id } = req.body;

    if (!unique_id) {
      console.log('Withdraw endpoint - Response: 400 Bad Request - Missing unique_id');
      return res.status(400).json({ error: 'Missing required field: unique_id' });
    }

    // Find transaction by id
    const transaction = await db.transactions.findByPk(unique_id);
    if (!transaction) {
      console.log('Withdraw endpoint - Response: 404 Not Found - Transaction not found for unique_id:', unique_id);
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Send message to group with approve/reject buttons
    const address = transaction.additional_info?.address || 'N/A';
    const user = await db.users.findByPk(transaction.userId);
    const amountUSDT = transaction.amount / 100;
    const messageText = `🚨 <b>New Withdrawal Request</b> 🚨\n\n👤 User ID: ${transaction.userId}\n👨 Username: ${user.username}\n💰 Amount: ${amountUSDT} USDT\n🏠 Address: <a href="https://bscscan.com/address/${address}">${address}</a>`;

    const replyMarkup = {
      inline_keyboard: [
        [
          { text: '✅ Approve', callback_data: `approve_${unique_id}` },
          { text: '❌ Reject', callback_data: `reject_${unique_id}` }
        ]
      ]
    };

    await sendMessage(appConfig.telegramGroupId, messageText, replyMarkup);

    console.log('Withdraw endpoint - Response: 200 Success - Transaction ID:', unique_id);
    res.status(200).json({ 
      success: true, 
      data: {
        withdrawalId: unique_id 
      },
      message: 'Withdrawal request sent for approval'
    });
  } catch (error) {
    console.error('Error handling withdraw:', error);
    console.log('Withdraw endpoint - Response: 500 Internal Server Error');
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  handleWithdraw
};
