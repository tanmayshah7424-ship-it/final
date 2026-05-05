const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.CRICAPI_KEY;

async function testCricAPI() {
    try {
        console.log('Testing CricAPI with key:', API_KEY.substring(0, 5) + '...');
        const response = await axios.get(`https://api.cricapi.com/v1/currentMatches?apikey=${API_KEY}`);
        console.log('Status:', response.data.status);
        if (response.data.status === 'success') {
            const matches = response.data.data;
            console.log('Total matches:', matches.length);
            // Look for the specific matches the user mentioned
            matches.slice(0, 5).forEach(m => {
                console.log(`Match: ${m.name}, Started: ${m.matchStarted}, Score:`, JSON.stringify(m.score));
            });
        } else {
            console.log('API Error:', response.data.reason || response.data);
        }
    } catch (err) {
        console.error('Fetch error:', err.message);
    }
}

testCricAPI();
