const axios = require('axios');
const Player = require('../models/Player');

const SPORTSDB_KEY = process.env.SPORTSDB_API_KEY || '3';
const BASE_URL = `https://www.thesportsdb.com/api/v1/json/${SPORTSDB_KEY}`;

// In-memory cache: key = "name", value = { data, timestamp }
const cache = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours (player bio rarely changes)

function getCached(key) {
    const entry = cache.get(key);
    if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
        return entry.data;
    }
    return null;
}

function setCache(key, data) {
    // Limit cache size
    if (cache.size > 100) {
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey);
    }
    cache.set(key, { data, timestamp: Date.now() });
}

async function searchPlayer(name) {
    if (!name) return null;
    const cacheKey = `search:${name.toLowerCase()}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    try {
        // 1. Try TheSportsDB with exact name
        let url = `${BASE_URL}/searchplayers.php?p=${encodeURIComponent(name)}`;
        let { data } = await axios.get(url, { timeout: 5000 });

        // 2. Fallback: If no results and multiple words, try just the words if it's a long string
        if (!data.player && name.includes(' ')) {
            const parts = name.split(' ');
            if (parts.length > 1) {
                // Try last two words or just last word
                const surname = parts.slice(-1)[0];
                url = `${BASE_URL}/searchplayers.php?p=${encodeURIComponent(surname)}`;
                const fallbackRes = await axios.get(url, { timeout: 5000 });
                if (fallbackRes.data && fallbackRes.data.player) {
                    data = fallbackRes.data;
                }
            }
        }

        if (data && data.player && data.player.length > 0) {
            // Find cricket or first
            const cricketPlayer = data.player.find(p => p.strSport === 'Cricket');
            const result = cricketPlayer || data.player[0];

            const simplified = {
                id: result.idPlayer,
                name: result.strPlayer,
                fullName: result.strPlayer,
                dob: result.dateBorn,
                birthLocation: result.strBirthLocation,
                nationality: result.strNationality,
                height: result.strHeight,
                sport: result.strSport,
                team: result.strTeam,
                position: result.strPosition,
                thumb: result.strThumb,
                banner: result.strBanner,
                description: result.strDescriptionEN,
                facebook: result.strFacebook,
                twitter: result.strTwitter,
                instagram: result.strInstagram,
                source: 'thesportsdb'
            };

            setCache(cacheKey, simplified);
            return simplified;
        }

        // 3. Fallback: Search our Local Database (MongoDB)
        const localPlayers = await Player.find({ $text: { $search: name } }).limit(1);
        if (localPlayers.length > 0) {
            const p = localPlayers[0];
            const localResult = {
                id: p._id.toString(),
                name: p.name,
                fullName: p.name,
                dob: p.dateOfBirth ? p.dateOfBirth.toISOString().split('T')[0] : '',
                nationality: p.country || '',
                sport: p.sport || 'cricket',
                thumb: p.playerImg || '',
                description: p.biography || '',
                source: 'local'
            };
            setCache(cacheKey, localResult);
            return localResult;
        }

        return null;
    } catch (err) {
        console.error(`Player search error for ${name}:`, err.message);
        throw err;
    }
}

module.exports = { searchPlayer };
