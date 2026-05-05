const https = require('https');
const { getIO } = require('../socket');
const Match = require('../models/Match');
const Team = require('../models/Team');

const API_KEY = process.env.SPORTSDB_API_KEY || '3';
const BASE = `https://www.thesportsdb.com/api/v1/json/${API_KEY}`;
const POLL_INTERVAL = 60_000; // 60 seconds

// In-memory cache
let cachedMatches = [];
let previousScores = new Map(); // idEvent -> "homeScore-awayScore"

function fetchJSON(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => {
                try { resolve(JSON.parse(data)); }
                catch (e) { reject(e); }
            });
        }).on('error', reject);
    });
}

function normalizeEvent(ev) {
    // Determine status from strStatus field
    let status = 'upcoming';
    const s = (ev.strStatus || '').toLowerCase();
    if (s === 'match finished' || s === 'ft' || s === 'aet' || s === 'ap') {
        status = 'completed';
    } else if (s === 'not started' || s === 'ns' || s === '') {
        status = 'upcoming';
    } else {
        // Any other status (1H, 2H, HT, live, numeric minute, etc.) means live
        status = 'live';
    }

    return {
        id: ev.idEvent,
        sport: 'cricket',
        tournament: ev.strLeague || '',
        status,
        venue: ev.strVenue || '',
        date: ev.dateEvent || '',
        time: ev.strTime || '',
        homeTeam: ev.strHomeTeam || '',
        awayTeam: ev.strAwayTeam || '',
        homeScore: ev.intHomeScore != null ? String(ev.intHomeScore) : '-',
        awayScore: ev.intAwayScore != null ? String(ev.intAwayScore) : '-',
        homeBadge: ev.strHomeTeamBadge || '',
        awayBadge: ev.strAwayTeamBadge || '',
        homeId: ev.idHomeTeam || '',
        awayId: ev.idAwayTeam || '',
        leagueId: ev.idLeague || '',
        source: 'thesportsdb',
    };
}

async function syncToDatabase(normalizedMatches) {
    for (const m of normalizedMatches) {
        try {
            // 1. Ensure Teams exist
            let homeTeam = await Team.findOneAndUpdate(
                { externalId: m.homeId, externalProvider: 'thesportsdb' },
                {
                    name: m.homeTeam,
                    shortName: m.homeTeam.substring(0, 3).toUpperCase(),
                    sport: 'cricket',
                    externalId: m.homeId,
                    externalProvider: 'thesportsdb',
                    logo: m.homeBadge || '🏏'
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );

            let awayTeam = await Team.findOneAndUpdate(
                { externalId: m.awayId, externalProvider: 'thesportsdb' },
                {
                    name: m.awayTeam,
                    shortName: m.awayTeam.substring(0, 3).toUpperCase(),
                    sport: 'cricket',
                    externalId: m.awayId,
                    externalProvider: 'thesportsdb',
                    logo: m.awayBadge || '🏏'
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );

            const matchDate = m.date ? new Date(m.date) : new Date();
            if (isNaN(matchDate.getTime())) {
                console.warn(`⚽ Invalid date for match ${m.id}: ${m.date}, defaulting to today`);
            }

            // 2. Sync Match
            await Match.findOneAndUpdate(
                { externalId: m.id, externalProvider: 'thesportsdb' },
                {
                    sport: 'cricket',
                    tournament: m.tournament,
                    status: m.status,
                    venue: m.venue || 'TBD',
                    date: isNaN(matchDate.getTime()) ? new Date() : matchDate,
                    teamA: homeTeam._id,
                    teamB: awayTeam._id,
                    scoreA: m.homeScore,
                    scoreB: m.awayScore,
                    summary: `${m.homeTeam} vs ${m.awayTeam}`,
                    externalId: m.id,
                    externalProvider: 'thesportsdb'
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
        } catch (error) {
            console.error(`⚽ Error syncing match ${m.id} to DB:`, error.message);
        }
    }
}

async function poll() {
    const System = require('../config/systemConfig');
    if (System.apiMode === 'manual') return;

    try {
        const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
        // Strictly poll for Cricket, never Soccer
        const url = `${BASE}/eventsday.php?d=${today}&s=Cricket`;
        const data = await fetchJSON(url);
        const events = data.events || [];

        const normalized = events.map(normalizeEvent);

        // Detect score changes and emit Socket.IO events
        const io = getIO();
        for (const match of normalized) {
            const key = match.id;
            const newScoreKey = `${match.homeScore}-${match.awayScore}-${match.status}`;
            const oldScoreKey = previousScores.get(key);

            if (io && oldScoreKey && oldScoreKey !== newScoreKey) {
                // Score or status changed — emit real-time update
                io.emit('score:update', match);
                console.log(`⚽ Score update: ${match.homeTeam} ${match.homeScore} - ${match.awayScore} ${match.awayTeam}`);
            }
            previousScores.set(key, newScoreKey);
        }

        cachedMatches = normalized;
        console.log(`📡 TheSportsDB: cached ${normalized.length} football events for ${today}`);

        // Sync to MongoDB
        await syncToDatabase(normalized);
    } catch (err) {
        console.error('TheSportsDB poll error:', err.message);
    }
}

function getCachedMatches(sport) {
    if (sport) {
        return cachedMatches.filter((m) => m.sport === sport.toLowerCase());
    }
    return cachedMatches;
}

function start() {
    console.log('🏟️  TheSportsDB polling started (every 60s)');
    poll(); // Initial fetch
    setInterval(poll, POLL_INTERVAL);
}

const getPlayerBio = async (name) => {
    try {
        const url = `${BASE}/searchplayers.php?p=${encodeURIComponent(name)}`;
        const data = await fetchJSON(url);
        if (data.player && data.player.length > 0) {
            const p = data.player[0];
            return {
                bio: p.strDescriptionEN,
                thumb: p.strThumb,
                country: p.strNationality,
                dob: p.dateBorn,
                sport: p.strSport
            };
        }
        return null;
    } catch (err) {
        console.error('SportsDB Player Search Error:', err.message);
        return null;
    }
};

module.exports = { start, getCachedMatches, getPlayerBio };
