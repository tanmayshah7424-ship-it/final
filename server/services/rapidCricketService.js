const https = require('https');
const { getIO } = require('../socket');
const Match = require('../models/Match');
const Team = require('../models/Team');

const API_KEY = process.env.CRICAPI_KEY;
const HOST = 'api.cricapi.com';
const POLL_INTERVAL = 60_000; // 1 minute

let cachedMatches = [];
let previousScores = new Map();

function fetchJSON(path) {
    return new Promise((resolve, reject) => {
        // path is like '/v1/currentMatches' (no trailing ?)
        const fullPath = `${path}?apikey=${API_KEY}&offset=0`;
        const options = {
            method: 'GET',
            hostname: HOST,
            path: fullPath,
            headers: { 'Content-Type': 'application/json' }
        };
        const req = https.request(options, function (res) {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try { resolve(JSON.parse(data)); }
                catch (e) { reject(e); }
            });
        });
        req.on('error', reject);
        req.end();
    });
}

function normalizeMatch(m) {
    const name = m.name || '';
    const teams = name.includes(' vs ') ? name.split(' vs ') : name.split(' v ');
    const homeTeam = teams[0]?.trim() || 'TBD';
    const awayTeam = teams[1]?.split(',')[0]?.trim() || 'TBD';

    let homeScore = '-';
    let awayScore = '-';

    if (m.score && Array.isArray(m.score)) {
        const homeInn = m.score.find(s => s.inning && s.inning.toLowerCase().includes(homeTeam.toLowerCase().substring(0, 4)));
        const awayInn = m.score.find(s => s.inning && s.inning.toLowerCase().includes(awayTeam.toLowerCase().substring(0, 4)));
        if (homeInn) homeScore = `${homeInn.r}/${homeInn.w} (${homeInn.o})`;
        if (awayInn) awayScore = `${awayInn.r}/${awayInn.w} (${awayInn.o})`;
    }

    // Improve team info matching
    const homeInfo = m.teamInfo?.find(t => {
        const tName = (t.name || '').toLowerCase();
        const hName = homeTeam.toLowerCase();
        return tName.includes(hName) || hName.includes(tName);
    });
    const awayInfo = m.teamInfo?.find(t => {
        const tName = (t.name || '').toLowerCase();
        const aName = awayTeam.toLowerCase();
        return tName.includes(aName) || aName.includes(tName);
    });

    // Determine status
    let status = 'upcoming';
    const s = (m.status || '').toLowerCase();
    if (s === 'match not started' || s.includes('not started')) {
        status = 'upcoming';
    } else if (s.includes('won') || s.includes('drawn') || s.includes('tied') || s.includes('abandoned') || s.includes('no result')) {
        status = 'completed';
    } else if (s !== '') {
        // Any other non-empty status means in progress
        status = 'live';
    }

    return {
        id: m.id,
        sport: 'cricket',
        tournament: m.matchType?.toUpperCase() || 'International',
        status,
        venue: m.venue || '',
        date: m.dateTimeGMT || '', // Store original date string
        time: m.dateTimeGMT ? new Date(m.dateTimeGMT).toLocaleTimeString() : '',
        homeTeam,
        awayTeam,
        homeScore,
        awayScore,
        homeBadge: homeInfo?.img || '',
        awayBadge: awayInfo?.img || '',
        summary: m.status || '',
        matchType: m.matchType || 'odi',
        source: 'cricapi',
    };
}

async function syncToDatabase(normalizedMatches) {
    for (const m of normalizedMatches) {
        try {
            // 1. Ensure Teams exist
            let homeTeam = await Team.findOneAndUpdate(
                { externalId: m.homeTeam, externalProvider: 'cricapi' },
                {
                    name: m.homeTeam,
                    shortName: m.homeTeam.substring(0, 3).toUpperCase(),
                    sport: 'cricket',
                    externalId: m.homeTeam,
                    externalProvider: 'cricapi',
                    logo: m.homeBadge || '🏆'
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );

            let awayTeam = await Team.findOneAndUpdate(
                { externalId: m.awayTeam, externalProvider: 'cricapi' },
                {
                    name: m.awayTeam,
                    shortName: m.awayTeam.substring(0, 3).toUpperCase(),
                    sport: 'cricket',
                    externalId: m.awayTeam,
                    externalProvider: 'cricapi',
                    logo: m.awayBadge || '🏆'
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );

            // 2. Sync Match
            await Match.findOneAndUpdate(
                { externalId: m.id, externalProvider: 'cricapi' },
                {
                    sport: 'cricket',
                    tournament: m.tournament,
                    status: m.status, // Ensure this is the normalized 'live', 'upcoming', or 'completed'
                    venue: m.venue || 'TBD',
                    date: m.date ? new Date(m.date) : new Date(), // Date required by schema
                    teamA: homeTeam._id,
                    teamB: awayTeam._id,
                    scoreA: m.homeScore,
                    scoreB: m.awayScore,
                    summary: m.summary, // Original raw status goes here
                    overs: m.overs || '',
                    externalId: m.id,
                    externalProvider: 'cricapi'
                },
                { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
            );
        } catch (error) {
            console.error(`🏏 Error syncing match ${m.id} to DB:`, error.message);
        }
    }
}

async function poll() {
    try {
        console.log('🏏 CricAPI Polling current matches...');
        // CricAPI response shape: { apikey: '...', data: [...] }
        // There is NO top-level `status` field — only `apikey` and `data`
        const response = await fetchJSON('/v1/currentMatches');
        if (!response || !Array.isArray(response.data)) {
            console.log('⚠️ CricAPI unexpected response:', JSON.stringify(response).substring(0, 200));
            return;
        }

        const matches = response.data.map(normalizeMatch);

        // Emit socket events for score changes
        const io = getIO();
        if (io) {
            for (const m of matches) {
                const key = m.id;
                const newKey = `${m.homeScore}-${m.awayScore}-${m.status}`;
                const oldKey = previousScores.get(key);
                if (oldKey && oldKey !== newKey) {
                    io.emit('score:update', m);
                    console.log(`🏏 Score update: ${m.homeTeam} vs ${m.awayTeam}`);
                }
                previousScores.set(key, newKey);
            }
        }

        cachedMatches = matches;
        console.log(`🏏 CricAPI: cached ${matches.length} matches (${matches.filter(m => m.status === 'live').length} live)`);

        // Sync to MongoDB
        await syncToDatabase(matches);
    } catch (error) {
        console.error('🏏 CricAPI Poll Error:', error.message);
    }
}

function getCachedMatches() {
    return cachedMatches;
}

function getCachedMatchById(id) {
    return cachedMatches.find(m => m.id === id) || null;
}

function start() {
    console.log('🏏 CricAPI polling started (every 60s)');
    poll();
    setInterval(poll, POLL_INTERVAL);
}

module.exports = {
    start,
    getCachedMatches,
    getCachedMatchById,

    getPlayer: async () => null,
    getTeam: async () => null,

    getCricketTeams: async () => [],
    getCricketPlayers: async () => [],

    // Compatibility methods for cricApi.js routes
    getMatchInfo: async (id) => {
        const match = cachedMatches.find(m => m.id === id);
        return { status: 'success', data: match || null };
    },
    getScorecard: async (id) => {
        const match = cachedMatches.find(m => m.id === id);
        return {
            status: 'success',
            data: {
                scorecard: [
                    { inning: match?.homeTeam || 'Team A', runs: match?.homeScore || 0, wickets: 0, overs: 0, batsman: [] },
                    { inning: match?.awayTeam || 'Team B', runs: match?.awayScore || 0, wickets: 0, overs: 0, batsman: [] }
                ]
            }
        };
    },
    getSquad: async () => ({ status: 'success', data: [] }),
    getPlayerInfo: async () => ({ status: 'success', data: null }),
    getSeries: async () => ({ status: 'success', data: [] }),
    getCountries: async () => ({ status: 'success', data: [] }),
};
