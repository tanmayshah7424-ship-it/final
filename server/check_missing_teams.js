const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const Match = require('./models/Match');
const Team = require('./models/Team');

async function debug() {
    await mongoose.connect(process.env.MONGODB_URI);
    const matches = await Match.find({ status: 'upcoming' });
    console.log(`Checking ${matches.length} matches...`);

    let missingA = 0;
    let missingB = 0;

    for (const m of matches) {
        const tA = await Team.findById(m.teamA);
        const tB = await Team.findById(m.teamB);
        if (!tA) missingA++;
        if (!tB) missingB++;
    }

    console.log(`Missing TeamA: ${missingA}`);
    console.log(`Missing TeamB: ${missingB}`);
    process.exit(0);
}
debug();
