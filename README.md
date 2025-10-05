# Telegram Access Token Bot

This Telegram bot verifies that users have joined required channels before issuing time-limited access tokens that can be used on your website.

## Features

1. **Channel Verification**: Ensures users join all required Telegram channels
2. **Token Generation**: Creates unique 12-character tokens with uppercase letters, lowercase letters, numbers, and special characters (@#$?:/)
3. **Token Copy Functionality**: Includes a copy button for easy token copying
4. **One-time Use**: Each token can only be used once
5. **Time-limited Access**: Tokens are valid for 5 minutes and grant 24-hour website access
6. **API Endpoints**: Provides endpoints for your website to verify tokens

## Setup

1. Add the bot as an administrator to all required channels
2. Update the channel list in [index.js](file:///C:/Users/suraj/Videos/bot%20acess/telegram-bot/index.js) if needed
3. Run the bot with `npm start`

## Required Channels

The bot requires users to join these channels:
- [@Team_Masters_TM](https://t.me/Team_Masters_TM)
- [@EduMaster2008](https://t.me/EduMaster2008)
- [@masters_chat_official](https://t.me/masters_chat_official)
- Private Channel 1: https://t.me/+uMpwtK3Bu8w0MzU1
- Private Channel 2: https://t.me/+rs2CiB7YDbJlM2M1

## API Endpoints

### Verify Token
```
POST /verify-token
Content-Type: application/json

{
  "token": "1234567890"
}
```

Response:
```json
{
  "valid": true,
  "message": "Token verified successfully",
  "userId": 123456789
}
```

### Check User Access
```
POST /check-access
Content-Type: application/json

{
  "userId": 123456789
}
```

Response:
```json
{
  "hasAccess": true,
  "message": "User has access"
}
```

## How It Works

1. User starts the bot with `/start`
2. Bot presents buttons to join all required channels
3. User joins all channels and clicks "Check Membership"
4. Bot verifies membership and generates a 10-digit token
5. User enters token on your website
6. Website calls `/verify-token` to validate the token
7. If valid, token grants 24-hour access to the website
8. Token can only be used once

## Logging

All important actions are logged to the console with timestamps for debugging and monitoring.