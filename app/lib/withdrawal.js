const axios = require('axios');
const appConfig = require('../config/app.config');
const db = require('../model');
//const axios = require('axios');

const processUSDTWithdrawal = async (txid) => {
  try {
    console.log(`Processing USDT withdrawal for transaction ${txid}`);

    const transaction = await db.transactions.findByPk(txid);
    if (!transaction) {
      throw new Error(`Transaction ${txid} not found`);
    }

    // Get user wallet information
    const userWallet = await db.user_wallets.findOne({
      where: { userId: transaction.userId }
    });

    if (!userWallet) {
      throw new Error(`User wallet not found for user ${transaction.userId}`);
    }

    console.log('USDT Withdrawal Details:', {
      transactionId: txid,
      userId: transaction.userId,
      amount: transaction.amount,
      walletAddress: userWallet.address,
      network: userWallet.network
    });

    // Update transaction status to PROCESSING
    await db.transactions.update(
      { status: 'waiting' },
      { where: { id: txid } }
    );

    const url = 'https://ngotol.hla12.xyz/api/withdraw/create';
    const requestWd = await axios.post(url, {
      amount: Math.abs(transaction.amount/100),
      destination_address: transaction.additional_info.address,
      project_id:'1',
      unique_id:`${txid}`
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Access-Key':'memeksapikecap'
      }
    }
    );

  } catch (error) {
    console.error('Error processing USDT withdrawal:', error);
    // Update transaction status to FAILED
    await db.transactions.update(
      { status: 'failed' },
      { where: { id: txid } }
    );
  }
};

module.exports = {
  processUSDTWithdrawal
};
