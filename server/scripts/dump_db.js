const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const Match = require('./models/Match');
const Team = require('./models/Team');

async function dump() {
    await mongoose.connect(process.env.MONGODB_URI);
    const teams = await Team.find();
    const matches = await Match.find().populate('teamA teamB');

    const output = {
        teams: teams.map(t => ({ id: t._id, name: t.name, sport: t.sport, logo: t.logo })),
        matches: matches.map(m => ({
            id: m._id,
            status: m.status,
            sport: m.sport,
            teamA: m.teamA?.name || m.teamA,
            teamB: m.teamB?.name || m.teamB,
            externalProvider: m.externalProvider
        }))
    };

    fs.writeFileSync(path.join(__dirname, 'db_dump.json'), JSON.stringify(output, null, 2));
    process.exit(0);
}
dump();
