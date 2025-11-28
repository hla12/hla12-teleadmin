const controller = require('./webhook.controller');

module.exports = (app) => {
  app.post('/webhook', controller.handleWebhook);
};
