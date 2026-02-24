const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const Match = require('./models/Match');
const Team = require('./models/Team');

async function check() {
    try {
        if (!process.env.MONGODB_URI) {
            console.error('MONGODB_URI not found in .env');
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const matchCount = await Match.countDocuments();
        const teamCount = await Team.countDocuments();
        const providers = await Match.aggregate([
            { $group: { _id: "$externalProvider", count: { $sum: 1 } } }
        ]);

        console.log('--- Stats ---');
        console.log('Total Matches:', matchCount);
        console.log('Total Teams:', teamCount);
        console.log('Providers:', providers);

        const latestMatches = await Match.find().sort({ createdAt: -1 }).limit(10).populate('teamA teamB');
        console.log('\n--- Latest 10 Matches ---');
        latestMatches.forEach(m => {
            console.log(`[${m.externalProvider || 'manual'}] ${m.teamA?.shortName || '?'} vs ${m.teamB?.shortName || '?'} - ${m.status} (${m.scoreA}-${m.scoreB})`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
