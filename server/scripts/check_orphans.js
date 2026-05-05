const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const Match = require('./models/Match');
const Team = require('./models/Team');

async function checkOrphans() {
    try {
        if (!process.env.MONGODB_URI) {
            console.error('MONGODB_URI not found in env');
            process.exit(1);
        }
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const matches = await Match.find({ status: 'live' });
        console.log(`Found ${matches.length} live matches.`);

        for (const m of matches) {
            const tA = await Team.findById(m.teamA);
            const tB = await Team.findById(m.teamB);
            console.log(`Match ${m._id}: teamA ID ${m.teamA} -> ${tA ? tA.name : 'MISSING'}, teamB ID ${m.teamB} -> ${tB ? tB.name : 'MISSING'}`);
        }

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkOrphans();
