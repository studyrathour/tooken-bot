# Website Integration Guide

This guide explains how to integrate your website with the Telegram bot's token verification system.

## API Endpoints

Your Telegram bot provides two methods for verifying tokens and checking access:

### 1. Token Verification

Verify a token to grant 24-hour access to a user.

**POST Request:**
```
POST https://competitive-karly-edumastersuraj-75acc2f2.koyeb.app/verify-token
Content-Type: application/json

{
  "token": "A1b2C3d4E5f6"
}
```

**GET Request:**
```
GET https://competitive-karly-edumastersuraj-75acc2f2.koyeb.app/verify-token?token=A1b2C3d4E5f6
```

**Response (Success):**
```json
{
  "valid": true,
  "message": "Token verified successfully",
  "userId": 123456789
}
```

**Response (Error):**
```json
{
  "valid": false,
  "message": "Invalid or expired token"
}
```

### 2. Access Check

Check if a user still has valid access (within their 24-hour window).

**POST Request:**
```
POST https://competitive-karly-edumastersuraj-75acc2f2.koyeb.app/check-access
Content-Type: application/json

{
  "userId": 123456789
}
```

**GET Request:**
```
GET https://competitive-karly-edumastersuraj-75acc2f2.koyeb.app/check-access?userId=123456789
```

**Response (Success):**
```json
{
  "hasAccess": true,
  "message": "User has access",
  "expiresAt": 1764987654321
}
```

**Response (Error):**
```json
{
  "hasAccess": false,
  "message": "User does not have access",
  "expiresAt": null
}
```

## Implementation Example

Here's a simple example of how to implement token verification on your website:

### Frontend Implementation (JavaScript)

```javascript
// Function to verify token
async function verifyToken(token) {
  try {
    const response = await fetch('https://competitive-karly-edumastersuraj-75acc2f2.koyeb.app/verify-token?token=' + encodeURIComponent(token), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (data.valid) {
      // Store userId and access status in localStorage
      localStorage.setItem('userId', data.userId);
      localStorage.setItem('hasAccess', 'true');
      localStorage.setItem('accessGrantedAt', Date.now());
      
      // Redirect to main content
      window.location.href = '/main-content';
    } else {
      // Show error message
      alert('Invalid or expired token: ' + data.message);
    }
  } catch (error) {
    console.error('Error verifying token:', error);
    alert('Error verifying token. Please try again.');
  }
}

// Function to check access
async function checkAccess() {
  const userId = localStorage.getItem('userId');
  const hasAccess = localStorage.getItem('hasAccess') === 'true';
  const accessGrantedAt = localStorage.getItem('accessGrantedAt');
  
  // Check if 24 hours have passed
  if (accessGrantedAt && (Date.now() - parseInt(accessGrantedAt)) > (24 * 60 * 60 * 1000)) {
    // Access has expired
    localStorage.removeItem('hasAccess');
    return false;
  }
  
  if (!userId || !hasAccess) {
    return false;
  }
  
  try {
    const response = await fetch(`https://competitive-karly-edumastersuraj-75acc2f2.koyeb.app/check-access?userId=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    return data.hasAccess;
  } catch (error) {
    console.error('Error checking access:', error);
    return false;
  }
}

// Protect your content
(async function() {
  if (window.location.pathname !== '/verify') {
    const hasAccess = await checkAccess();
    if (!hasAccess) {
      window.location.href = '/verify';
    }
  }
})();
```

### Backend Implementation (Node.js/Express)

```javascript
const express = require('express');
const axios = require('axios');
const app = express();

// Middleware to check access
async function requireAccess(req, res, next) {
  // Skip access check for the verification page
  if (req.path === '/verify') {
    return next();
  }
  
  const userId = req.session.userId;
  
  if (!userId) {
    return res.redirect('/verify');
  }
  
  try {
    const response = await axios.get(`https://competitive-karly-edumastersuraj-75acc2f2.koyeb.app/check-access?userId=${userId}`);
    const data = response.data;
    
    if (data.hasAccess) {
      next();
    } else {
      res.redirect('/verify');
    }
  } catch (error) {
    console.error('Error checking access:', error);
    res.redirect('/verify');
  }
}

// Apply middleware to all routes
app.use(requireAccess);

// Verification page
app.get('/verify', (req, res) => {
  res.send(`
    <form id="tokenForm">
      <h2>Enter Access Token</h2>
      <input type="text" id="token" placeholder="Enter your 12-character token" required>
      <button type="submit">Verify Token</button>
    </form>
    <div id="message"></div>
    
    <script>
      document.getElementById('tokenForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const token = document.getElementById('token').value;
        
        try {
          const response = await fetch('https://competitive-karly-edumastersuraj-75acc2f2.koyeb.app/verify-token?token=' + encodeURIComponent(token));
          const data = await response.json();
          
          if (data.valid) {
            // Store userId in session (implementation depends on your session management)
            // Then redirect to main content
            window.location.href = '/main-content';
          } else {
            document.getElementById('message').innerHTML = '<p style="color: red;">' + data.message + '</p>';
          }
        } catch (error) {
          document.getElementById('message').innerHTML = '<p style="color: red;">Error verifying token. Please try again.</p>';
        }
      });
    </script>
  `);
});

// Protected content
app.get('/main-content', (req, res) => {
  res.send('<h1>Protected Content</h1><p>You have access to this content!</p>');
});

app.listen(3001, () => {
  console.log('Website server running on port 3001');
});
```

## Token Format

Tokens generated by the bot have the following characteristics:
- Exactly 12 characters long
- Contains uppercase letters (A-Z)
- Contains lowercase letters (a-z)
- Contains numbers (0-9)
- Contains special characters (@#$?:/)
- Example: `A1b2C3d4@#E5`

## Important Notes

1. **Token Validity**: Tokens are valid for 5 minutes after generation
2. **One-time Use**: Each token can only be used once
3. **Access Duration**: Successful verification grants 24-hour access
4. **Rate Limiting**: Avoid making too many requests in a short period
5. **HTTPS**: Always use HTTPS in production environments

## Troubleshooting

1. **Invalid Token Error**: 
   - Ensure the token is exactly 12 characters
   - Check that the token hasn't expired (5-minute limit)
   - Verify the token hasn't been used already

2. **Access Check Fails**:
   - Check that the userId is correct
   - Verify that 24 hours haven't passed since verification

3. **Network Errors**:
   - Ensure your server can reach the Koyeb endpoint
   - Check your firewall settings
   - Verify the endpoint URL is correct

This integration allows your website to securely verify users through the Telegram bot system, providing a seamless access control mechanism.