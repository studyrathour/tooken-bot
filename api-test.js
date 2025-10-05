// Test script for the Telegram bot API endpoints (both POST and GET versions)
const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000';

// Test token verification (POST)
async function testTokenVerificationPOST() {
    try {
        console.log('Testing token verification (POST)...');
        
        const response = await axios.post(`${BASE_URL}/verify-token`, {
            token: 'A1b2C3d4E5f6'
        });
        
        console.log('Token verification (POST) response:', response.data);
    } catch (error) {
        console.log('Token verification (POST) error:', error.response?.data || error.message);
    }
}

// Test token verification (GET)
async function testTokenVerificationGET() {
    try {
        console.log('\nTesting token verification (GET)...');
        
        const response = await axios.get(`${BASE_URL}/verify-token?token=A1b2C3d4E5f6`);
        
        console.log('Token verification (GET) response:', response.data);
    } catch (error) {
        console.log('Token verification (GET) error:', error.response?.data || error.message);
    }
}

// Test access check (POST)
async function testAccessCheckPOST() {
    try {
        console.log('\nTesting access check (POST)...');
        
        const response = await axios.post(`${BASE_URL}/check-access`, {
            userId: '123456789'
        });
        
        console.log('Access check (POST) response:', response.data);
    } catch (error) {
        console.log('Access check (POST) error:', error.response?.data || error.message);
    }
}

// Test access check (GET)
async function testAccessCheckGET() {
    try {
        console.log('\nTesting access check (GET)...');
        
        const response = await axios.get(`${BASE_URL}/check-access?userId=123456789`);
        
        console.log('Access check (GET) response:', response.data);
    } catch (error) {
        console.log('Access check (GET) error:', error.response?.data || error.message);
    }
}

// Run tests
async function runTests() {
    console.log('Running API tests...\n');
    
    await testTokenVerificationPOST();
    await testTokenVerificationGET();
    await testAccessCheckPOST();
    await testAccessCheckGET();
    
    console.log('\nTests completed.');
}

runTests();