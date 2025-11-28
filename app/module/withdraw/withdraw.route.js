const controller = require("./withdraw.controller");

module.exports = (app) => {
  app.post("/withdraw/create", controller.handleWithdraw);
};