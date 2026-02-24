const mongoose = require('mongoose');
const Match = require('./models/Match');
const Team = require('./models/Team');
require('dotenv').config();

async function listCricket() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');
        const matches = await Match.find({ sport: 'cricket' }).populate('teamA teamB');
        console.log('Total cricket matches in DB:', matches.length);
        matches.forEach(m => {
            console.log(`- [${m.externalId}] ${m.teamA?.name} vs ${m.teamB?.name}: ${m.scoreA} - ${m.scoreB} (${m.status})`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

listCricket();
