# Telegram Admin Panel

A comprehensive admin panel for managing a Telegram bot with user transactions, games, investments, and RTP tracking. Built with Node.js, Express, and Sequelize for PostgreSQL.

## Features

- **Telegram Bot Integration**: Webhook-based bot handling with command processing
- **User Management**: User registration, balances, referrals, and earnings tracking
- **Transaction System**: Comprehensive transaction logging with multiple types
- **Game Management**: Game records, RTP data, and configuration management
- **Investment Tracking**: User investments with status and return calculations
- **Affiliate System**: Multi-level affiliate earnings tracking
- **RTP Monitoring**: Real-time RTP tracking and reporting for games
- **Admin Dashboard**: RESTful API for admin operations

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL with Sequelize ORM
- **Bot Framework**: Telegram Bot API
- **Other**: Axios for HTTP requests, CORS support

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database
- Telegram Bot Token (from @BotFather)

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd telegram-admin-panel
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables or create config files (see Configuration section)

## Configuration

### Database Configuration

Create `app/config/db.config.js`:

```javascript
module.exports = {
    HOST: "localhost",
    USER: "your_db_user",
    PASSWORD: "your_db_password",
    DB: "bot",
    dialect: "postgres",
    port: 5432,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
};
```

### App Configuration

Create `app/config/app.config.js`:

```javascript
module.exports = {
    appName: 'MyApp',
    telegramBotToken: 'your_telegram_bot_token',
    webhookUrl: 'https://your-domain.com/webhook',
    commands: [
        {
            command: '/start',
            description: 'Restart Bot'
        },
        {
            command: '/menu',
            description: 'Show Menu'
        },
        {
            command: '/withdraw',
            description: 'Withdraw data'
        }
    ],
    telegramGroupId: 'your_telegram_group_id',
    secretKey: 'your_secret_key'
};
```

## Database Setup

1. Create a PostgreSQL database named `bot`

2. The application will automatically sync the database schema on startup using Sequelize models

3. Run the application once to create tables:
   ```bash
   npm start
   ```

## Running the Application

### Development
```bash
npm start
```

### Production
Set `NODE_ENV=production` and configure your production database settings.

The server will start on port 6969 by default, or the port specified in `PORT` environment variable.

## API Endpoints

### Webhook
- `POST /webhook` - Telegram bot webhook endpoint

### Health Check
- `GET /` - Application health check

## Telegram Bot Setup

1. Create a bot with @BotFather on Telegram
2. Set the webhook URL to point to your server's `/webhook` endpoint
3. Configure the bot commands using the commands array in `app.config.js`

The application automatically sets the webhook and commands on startup.

## Database Models

- **User**: User accounts with balances and referral system
- **Transaction**: All financial transactions
- **Game**: Individual game records
- **Investment**: User investment tracking
- **AffiliateEarning**: Affiliate commission tracking
- **RtpReport**: RTP reporting data
- **RtpTracking**: Real-time RTP monitoring
- **UserRtpTracking**: Per-user RTP statistics
- **GameConfig**: Game configuration settings
- **GameRtpData**: Detailed game RTP data

## Project Structure

```
├── app/
│   ├── config/
│   │   ├── app.config.js
│   │   └── db.config.js
│   ├── model/
│   │   ├── index.js
│   │   └── *.model.js
│   └── module/
│       └── webhook/
│           ├── webhook.controller.js
│           └── webhook.routes.js
├── index.js
├── package.json
├── .gitignore
└── README.md
```

## Security Notes

- Sensitive configuration files are gitignored
- Use environment variables for production deployments
- Regularly rotate bot tokens and database credentials
- Implement proper authentication for admin endpoints

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support or questions, please open an issue in the repository.