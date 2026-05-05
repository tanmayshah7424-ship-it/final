const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.CRICAPI_KEY;

async function testTeamInfo() {
    try {
        const response = await axios.get(`https://api.cricapi.com/v1/currentMatches?apikey=${API_KEY}`);
        if (response.data.status === 'success') {
            const matches = response.data.data;
            matches.slice(0, 5).forEach(m => {
                console.log(`Match: ${m.name}`);
                console.log(`- Teams: ${JSON.stringify(m.teams)}`);
                console.log(`- TeamInfo Logos: ${JSON.stringify(m.teamInfo?.map(t => ({ name: t.name, img: t.img })))}`);
                console.log(`- Scores: ${JSON.stringify(m.score)}`);
                console.log('---');
            });
        }
    } catch (err) {
        console.error(err);
    }
}

testTeamInfo();
