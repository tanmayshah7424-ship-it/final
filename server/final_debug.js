const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const Match = require('./models/Match');
const Team = require('./models/Team');

async function debug() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('--- Database Verification ---');

        const teamsCount = await Team.countDocuments();
        const matchesCount = await Match.countDocuments();
        console.log(`Teams total: ${teamsCount}`);
        console.log(`Matches total: ${matchesCount}`);

        const statuses = await Match.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);
        console.log('Statuses:', JSON.stringify(statuses, null, 2));

        const upcoming = await Match.find({ status: 'upcoming' });
        console.log(`find({status: 'upcoming'}) returned ${upcoming.length} records.`);

        if (upcoming.length > 0) {
            console.log('Sample upcoming ID:', upcoming[0]._id);
            console.log('Sample upcoming teams:', upcoming[0].teamA, 'vs', upcoming[0].teamB);
        }

        process.exit(0);
    } catch (err) {
        console.error('DEBUG FATAL:', err);
        process.exit(1);
    }
}
debug();
