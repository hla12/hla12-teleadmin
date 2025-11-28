const express = require("express");
const cors = require("cors");
const bodyParser = require('body-parser');
const app = express();
const axios = require('axios');
const appConfig = require('./app/config/app.config.js');

var corsOptions = {
  origin: "*"
};

app.use(function (req, res, next) {
    delete req.headers['content-encoding'];
    next();
})
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(cors({
    origin: '*'
}));

const db = require("./app/model");
db.sequelize.sync()
  .then(() => {
    console.log("Synced db.");
  })
  .catch((err) => {
    console.log("Failed to sync db: " + err.message);
  });

// Set Telegram webhook and commands
const setWebhook = async () => {
  try {
    const response = await axios.post(`https://api.telegram.org/bot${appConfig.telegramBotToken}/setWebhook`, {
      url: appConfig.webhookUrl
    });
    console.log('Webhook set:', response.data);
  } catch (error) {
    console.error('Error setting webhook:', error.response?.data || error.message);
  }
};

const setCommands = async () => {
  try {
    const response = await axios.post(`https://api.telegram.org/bot${appConfig.telegramBotToken}/setMyCommands`, {
      commands: appConfig.commands
    });
    console.log('Commands set:', response.data);
  } catch (error) {
    console.error('Error setting commands:', error.response?.data || error.message);
  }
};

setWebhook();
setCommands();

app.get("/", (req, res) => {
  res.json({ message: "Welcome to staging application." });
});

//import memek sapi kecap
require("./app/module/webhook/webhook.routes")(app)

//set webhook, set command
const PORT = process.env.PORT || 6969;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});