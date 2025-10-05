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
2. Update the channel list in index.js if needed
3. Run the bot with `npm start`

## Required Channels

The bot requires users to join these channels:
- [@Team_Masters_TM](https://t.me/Team_Masters_TM)
- [@EduMaster2008](https://t.me/EduMaster2008)
- [@masters_chat_official](https://t.me/masters_chat_official)
- Private Channel 1: https://t.me/+uMpwtK3Bu8w0MzU1
- Private Channel 2: https://t.me/+rs2CiB7YDbJlM2M1

## GitHub Repository

See [GITHUB_INSTRUCTIONS.md](GITHUB_INSTRUCTIONS.md) for instructions on how to push this project to your GitHub repository.

## API Endpoints

### Verify Token
```
POST /verify-token
Content-Type: application/json

{
  "token": "A1b2C3d4E5f6"
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
4. Bot verifies membership and generates a 12-character token with mixed characters
5. Token is displayed with a "Copy Token" button
6. User clicks the button to acknowledge copying and uses the token on your website
7. Website calls `/verify-token` to validate the token
8. If valid, token grants 24-hour access to the website
9. Token can only be used once

## Logging

All important actions are logged to the console with timestamps for debugging and monitoring.