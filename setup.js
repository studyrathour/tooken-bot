#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Telegram Bot Setup Automation Script');
console.log('====================================');

try {
    // Check if we're in the right directory
    const currentDir = process.cwd();
    console.log(`Current directory: ${currentDir}`);
    
    // Check if package.json exists
    if (!fs.existsSync(path.join(currentDir, 'package.json'))) {
        console.log('Error: package.json not found. Please run this script from the project root directory.');
        process.exit(1);
    }
    
    console.log('✓ Project directory verified');
    
    // Install dependencies
    console.log('\nInstalling dependencies...');
    execSync('npm install', { stdio: 'inherit' });
    console.log('✓ Dependencies installed successfully');
    
    // Create .env file if it doesn't exist
    const envPath = path.join(currentDir, '.env');
    if (!fs.existsSync(envPath)) {
        console.log('\nCreating .env file...');
        const envContent = `# Telegram Bot Token
BOT_TOKEN=7951849850:AAGYROmnw9tWSiQu9OtoYfemmhS6xE8p58E

# Server Port
PORT=3000`;
        fs.writeFileSync(envPath, envContent);
        console.log('✓ .env file created');
    } else {
        console.log('\n.env file already exists, skipping creation');
    }
    
    // Verify Node.js version
    const nodeVersion = process.version;
    console.log(`\nNode.js version: ${nodeVersion}`);
    
    // Verify npm version
    const npmVersion = execSync('npm --version', { encoding: 'utf-8' }).trim();
    console.log(`npm version: ${npmVersion}`);
    
    console.log('\nSetup completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Make sure to add your bot as admin to all required channels:');
    console.log('   - https://t.me/Team_Masters_TM');
    console.log('   - https://t.me/+uMpwtK3Bu8w0MzU1');
    console.log('   - https://t.me/+rs2CiB7YDbJlM2M1');
    console.log('   - https://t.me/EduMaster2008');
    console.log('   - https://t.me/masters_chat_official');
    console.log('\n2. Start the bot with: npm start');
    console.log('   or for development: npm run dev');
    
} catch (error) {
    console.error('Setup failed:', error.message);
    process.exit(1);
}