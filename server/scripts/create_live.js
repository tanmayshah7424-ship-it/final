const mongoose = require('mongoose');
const Match = require('./models/Match');
const Team = require('./models/Team');
require('dotenv').config();

async function createLive() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        let teamA = await Team.findOne({ shortName: 'LIV' });
        let teamB = await Team.findOne({ shortName: 'MUN' });

        if (!teamA) {
            teamA = await Team.create({ name: 'Liverpool', shortName: 'LIV', sport: 'football', logo: '⚽' });
        }
        if (!teamB) {
            teamB = await Team.create({ name: 'Manchester United', shortName: 'MUN', sport: 'football', logo: '⚽' });
        }

        const match = await Match.create({
            sport: 'football',
            tournament: 'Premier League',
            status: 'live',
            venue: 'Anfield',
            date: new Date(),
            teamA: teamA._id,
            teamB: teamB._id,
            scoreA: '2',
            scoreB: '1',
            summary: 'Second half in progress',
            minute: '75'
        });

        console.log('Created live match:', match._id);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

createLive();
