const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const Match = require('./models/Match');

async function debug() {
    await mongoose.connect(process.env.MONGODB_URI);
    const count = await Match.countDocuments({ status: 'upcoming' });
    console.log(`Total upcoming in DB: ${count}`);

    const matches = await Match.find({ status: 'upcoming' }).populate('teamA teamB');
    console.log(`Query find({status: 'upcoming'}) returned: ${matches.length}`);

    matches.forEach((m, i) => {
        console.log(`${i + 1}. [${m.sport}] ${m.tournament} - ${m.teamA?.name || m.teamA || '?'} vs ${m.teamB?.name || m.teamB || '?'}`);
    });

    process.exit(0);
}
debug();
