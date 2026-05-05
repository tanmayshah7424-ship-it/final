const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const Match = require('./models/Match');
const Team = require('./models/Team');

async function debug() {
    await mongoose.connect(process.env.MONGODB_URI);
    const matches = await Match.find({ status: 'upcoming' });
    console.log(`Checking ${matches.length} upcoming matches for team existence...`);

    for (const m of matches) {
        const [tA, tB] = await Promise.all([
            Team.findById(m.teamA),
            Team.findById(m.teamB)
        ]);
        console.log(`Match ${m._id}: A=${m.teamA} (${tA ? 'OK' : 'MISSING'}), B=${m.teamB} (${tB ? 'OK' : 'MISSING'})`);
    }
    process.exit(0);
}
debug();
