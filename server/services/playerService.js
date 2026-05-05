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

    let candidate = null;

    try {
        // 1. Try TheSportsDB
        let url = `${BASE_URL}/searchplayers.php?p=${encodeURIComponent(name)}`;
        let { data } = await axios.get(url, { timeout: 5000 });

        if (!data.player && name.includes(' ')) {
            const parts = name.split(' ');
            const surname = parts.slice(-1)[0];
            url = `${BASE_URL}/searchplayers.php?p=${encodeURIComponent(surname)}`;
            const fallbackRes = await axios.get(url, { timeout: 5000 });
            if (fallbackRes.data && fallbackRes.data.player) data = fallbackRes.data;
        }

        if (data && data.player && data.player.length > 0) {
            const result = data.player.find(p => p.strSport?.toLowerCase() === 'cricket') || data.player[0];
            candidate = {
                id: result.idPlayer,
                name: result.strPlayer,
                fullName: result.strPlayer,
                dob: result.dateBorn,
                birthLocation: result.strBirthLocation,
                nationality: result.strNationality,
                height: result.strHeight,
                sport: result.strSport || 'cricket',
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
            
            if (candidate.description && candidate.description.trim().length > 50) {
                setCache(cacheKey, candidate);
                return candidate;
            }
        }

        // 2. Try Local DB if no candidate or no description
        if (!candidate || !candidate.description) {
            const localPlayers = await Player.find({ name: new RegExp(name, 'i') }).limit(1);
            if (localPlayers.length > 0) {
                const p = localPlayers[0];
                const localData = {
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

                if (!candidate) {
                    candidate = localData;
                } else if (!candidate.description && localData.description) {
                    candidate.description = localData.description;
                    candidate.source += '+local';
                }

                if (candidate.description && candidate.description.trim().length > 50) {
                    setCache(cacheKey, candidate);
                    return candidate;
                }
            }
        }

        // 3. AI Fallback for Description
        try {
            console.log(`[PlayerService] 🔍 Final attempt: Synthesizing biography for ${name}...`);
            const genAi = require('../../ai/modules/gen');
            const prompt = `Write a professional, 3-paragraph biography for the cricket player "${name}". Include their role, key achievements, and playing style. Focus on their international career. Format as plain text with newlines.`;
            
            const aiBio = await genAi.generate(prompt);
            if (aiBio && aiBio.length > 30) {
                if (!candidate) {
                    candidate = {
                        id: `ai-${Date.now()}`,
                        name: name,
                        fullName: name,
                        sport: 'cricket',
                        description: aiBio,
                        source: 'gen-ai'
                    };
                } else {
                    candidate.description = aiBio;
                    candidate.source += '+ai';
                }
                setCache(cacheKey, candidate);
                return candidate;
            }
        } catch (aiErr) {
            console.error(`[PlayerService] AI Bio Synthesis failed:`, aiErr.message);
        }

        return candidate; // Return whatever we managed to find
    } catch (err) {
        console.error(`[PlayerService] Global error:`, err.message);
        return candidate;
    }
}

module.exports = { searchPlayer };
