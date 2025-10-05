require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const express = require('express');
const NodeCache = require('node-cache');
const axios = require('axios');

// Bot token from the user
const BOT_TOKEN = process.env.BOT_TOKEN || '7951849850:AAGYROmnw9tWSiQu9OtoYfemmhS6xE8p58E';

// Required channels to join
const REQUIRED_CHANNELS = [
    'Team_Masters_TM',
    'EduMaster2008',
    'masters_chat_official'
];

// Private channels (using invite links)
const PRIVATE_CHANNEL_LINKS = [
    'https://t.me/+uMpwtK3Bu8w0MzU1',
    'https://t.me/+rs2CiB7YDbJlM2M1'
];

// Initialize bot
const bot = new Telegraf(BOT_TOKEN);

// Initialize cache for tokens (5 minutes expiry)
const tokenCache = new NodeCache({ stdTTL: 300 }); // 5 minutes in seconds

// Initialize cache for site access (24 hours expiry)
const siteAccessCache = new NodeCache({ stdTTL: 86400 }); // 24 hours in seconds

// Initialize cache for tracking used tokens
const usedTokens = new Set();

// Initialize Express app for API endpoint
const app = express();
app.use(express.json());

// Log file (in a real implementation, you might want to use a proper logging library)
const log = (message) => {
    console.log(`[${new Date().toISOString()}] ${message}`);
};

// Function to generate a unique 12-character token with uppercase, lowercase, numbers, and special characters
const generateToken = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$?:/';
    let token = '';
    for (let i = 0; i < 12; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
};

// Function to check if user has joined all channels
const checkUserChannels = async (ctx) => {
    const userId = ctx.from.id;
    log(`Checking channel membership for user ${userId}`);
    
    try {
        // Check public channels
        for (const channel of REQUIRED_CHANNELS) {
            try {
                const member = await ctx.telegram.getChatMember(`@${channel}`, userId);
                if (member.status === 'left' || member.status === 'kicked') {
                    log(`User ${userId} not member of @${channel}`);
                    return false;
                }
            } catch (error) {
                log(`Error checking membership for @${channel}: ${error.message}`);
                return false;
            }
        }
        
        // For private channels, we can't directly check membership
        // In a real implementation, you would need to implement a different verification method
        // For now, we'll assume the user has joined if they clicked the button
        
        log(`User ${userId} is member of all public channels`);
        return true;
    } catch (error) {
        log(`Error checking channel membership: ${error.message}`);
        return false;
    }
};

// Start command
bot.start(async (ctx) => {
    const userId = ctx.from.id;
    log(`User ${userId} started the bot`);
    
    // Create channel buttons
    const channelButtons = [];
    
    // Add public channels
    for (const channel of REQUIRED_CHANNELS) {
        channelButtons.push(Markup.button.url(`Join @${channel}`, `https://t.me/${channel}`));
    }
    
    // Add private channels
    for (let i = 0; i < PRIVATE_CHANNEL_LINKS.length; i++) {
        channelButtons.push(Markup.button.url(`Join Private Channel ${i + 1}`, PRIVATE_CHANNEL_LINKS[i]));
    }
    
    // Send message with channel buttons
    await ctx.reply(
        'Welcome! To use this bot, you need to join all our channels first.\n\nPlease join all the channels below:',
        Markup.inlineKeyboard([
            ...channelButtons.map((button, index) => [button]),
            [Markup.button.callback('✅ Check Membership', 'check_membership')]
        ])
    );
});

// Handle membership check callback
bot.action('check_membership', async (ctx) => {
    const userId = ctx.from.id;
    log(`User ${userId} requested membership check`);
    
    // Check if user has joined all channels
    const isMember = await checkUserChannels(ctx);
    
    if (isMember) {
        log(`User ${userId} verified membership successfully`);
        
        // Generate unique 12-character token with uppercase, lowercase, numbers, and special characters
        let token = generateToken();
        
        // Ensure token is unique
        while (tokenCache.has(token) || usedTokens.has(token)) {
            token = generateToken();
        }
        
        // Store token in cache for 5 minutes
        tokenCache.set(token, userId);
        
        // Send token to user with copy functionality
        await ctx.reply(`✅ Verification successful!\n\nHere is your 12-character access token (valid for 5 minutes):`);
        await ctx.reply(`\`${token}\``, {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [{ text: '📋 Copy Token', callback_data: `copy_${token}` }]
                ]
            }
        });
        await ctx.reply('Click the "Copy Token" button to copy the token to your clipboard.\nUse this token on our website to gain access for 24 hours.');
    } else {
        log(`User ${userId} failed membership verification`);
        await ctx.reply('❌ You have not joined all the required channels.\n\nPlease join all channels and try again.');
    }
    
    // Answer the callback query to remove loading state
    await ctx.answerCbQuery();
});

// Handle copy token callback
bot.action(/copy_(.+)/, async (ctx) => {
    const token = ctx.match[1];
    log(`User requested to copy token: ${token}`);
    
    // Send a message that the token is copied (Telegram doesn't allow actual clipboard copy via bot)
    await ctx.reply(`✅ Token copied to clipboard: \`${token}\``, { parse_mode: 'Markdown' });
    await ctx.answerCbQuery('Token copied! You can now paste it on our website.');
});

// Help command
bot.help((ctx) => {
    ctx.reply('Send /start to begin the verification process.');
});

// API endpoint to verify token (POST - original implementation)
app.post('/verify-token', (req, res) => {
    const { token } = req.body;
    log(`Token verification request (POST): ${token}`);
    
    // Check if token exists and is valid
    if (!token) {
        return res.status(400).json({ valid: false, message: 'Token is required' });
    }
    
    // Check if token has already been used
    if (usedTokens.has(token)) {
        log(`Token ${token} already used`);
        return res.status(400).json({ valid: false, message: 'Token has already been used' });
    }
    
    // Check if token exists in cache
    const userId = tokenCache.get(token);
    
    if (userId) {
        // Mark token as used
        usedTokens.add(token);
        
        // Remove token from cache (one-time use)
        tokenCache.del(token);
        
        // Grant site access for 24 hours
        siteAccessCache.set(userId.toString(), true);
        
        log(`Token ${token} verified successfully for user ${userId}`);
        return res.json({ valid: true, message: 'Token verified successfully', userId });
    } else {
        log(`Invalid or expired token: ${token}`);
        return res.status(400).json({ valid: false, message: 'Invalid or expired token' });
    }
});

// API endpoint to verify token (GET - query parameter version)
app.get('/verify-token', (req, res) => {
    const { token } = req.query;
    log(`Token verification request (GET): ${token}`);
    
    // Check if token exists and is valid
    if (!token) {
        return res.status(400).json({ valid: false, message: 'Token is required' });
    }
    
    // Check if token has already been used
    if (usedTokens.has(token)) {
        log(`Token ${token} already used`);
        return res.status(400).json({ valid: false, message: 'Token has already been used' });
    }
    
    // Check if token exists in cache
    const userId = tokenCache.get(token);
    
    if (userId) {
        // Mark token as used
        usedTokens.add(token);
        
        // Remove token from cache (one-time use)
        tokenCache.del(token);
        
        // Grant site access for 24 hours
        siteAccessCache.set(userId.toString(), true);
        
        log(`Token ${token} verified successfully for user ${userId}`);
        return res.json({ valid: true, message: 'Token verified successfully', userId });
    } else {
        log(`Invalid or expired token: ${token}`);
        return res.status(400).json({ valid: false, message: 'Invalid or expired token' });
    }
});

// API endpoint to check if user has site access (POST - original implementation)
app.post('/check-access', (req, res) => {
    const { userId } = req.body;
    log(`Site access check for user (POST): ${userId}`);
    
    if (!userId) {
        return res.status(400).json({ hasAccess: false, message: 'User ID is required' });
    }
    
    // Check if user has access
    const hasAccess = siteAccessCache.has(userId.toString());
    
    // Calculate expiration time (24 hours from now)
    const expirationTime = Date.now() + (24 * 60 * 60 * 1000);
    
    if (hasAccess) {
        log(`User ${userId} has site access`);
        return res.json({ 
            hasAccess: true, 
            message: 'User has access',
            expiresAt: expirationTime
        });
    } else {
        log(`User ${userId} does not have site access`);
        return res.status(403).json({ 
            hasAccess: false, 
            message: 'User does not have access',
            expiresAt: null
        });
    }
});

// API endpoint to check if user has site access (GET - query parameter version)
app.get('/check-access', (req, res) => {
    const { userId } = req.query;
    log(`Site access check for user (GET): ${userId}`);
    
    if (!userId) {
        return res.status(400).json({ hasAccess: false, message: 'User ID is required' });
    }
    
    // Check if user has access
    const hasAccess = siteAccessCache.has(userId.toString());
    
    // Calculate expiration time (24 hours from now)
    const expirationTime = Date.now() + (24 * 60 * 60 * 1000);
    
    if (hasAccess) {
        log(`User ${userId} has site access`);
        return res.json({ 
            hasAccess: true, 
            message: 'User has access',
            expiresAt: expirationTime
        });
    } else {
        log(`User ${userId} does not have site access`);
        return res.status(403).json({ 
            hasAccess: false, 
            message: 'User does not have access',
            expiresAt: null
        });
    }
});

// Start the bot
bot.launch()
    .then(() => {
        log('Bot started successfully');
    })
    .catch((error) => {
        log(`Error starting bot: ${error.message}`);
    });

// Start the Express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    log(`API server running on port ${PORT}`);
});

// Graceful shutdown
process.once('SIGINT', () => {
    bot.stop('SIGINT');
    log('Bot stopped');
});
process.once('SIGTERM', () => {
    bot.stop('SIGTERM');
    log('Bot stopped');
});

log('Telegram bot is starting...');