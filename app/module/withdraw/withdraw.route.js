const controller = require("./withdraw.controller");

const accessKeyMiddleware = (req, res, next) => {
  const accessKey = req.headers['Access-Key'];
  if (accessKey !== 'memeksapikecap') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

module.exports = (app) => {
  app.post("/withdraw/create", accessKeyMiddleware, controller.handleWithdraw);
};