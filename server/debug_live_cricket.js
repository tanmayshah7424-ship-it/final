const mongoose = require('mongoose');
const Match = require('./models/Match');
const Team = require('./models/Team');
require('dotenv').config();

async function debugLive() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');
        const matches = await Match.find({ sport: 'cricket', status: 'live' }).populate('teamA teamB');
        console.log('Live Cricket Matches:', matches.length);
        matches.forEach(m => {
            console.log(`- [${m.externalId}] ${m.teamA?.name} vs ${m.teamB?.name}`);
            console.log(`  Scores: A:${m.scoreA} B:${m.scoreB}`);
            console.log(`  Logos: A:${m.teamA?.logo ? 'Yes' : 'No'} B:${m.teamB?.logo ? 'Yes' : 'No'}`);
            console.log(`  Summary: ${m.summary}`);
            console.log('-------------------');
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

debugLive();
