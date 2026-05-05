const { getCachedMatches: getFootballMatches } = require('../services/sportsDbService');
const { getCachedMatches: getCricketMatches, getCachedMatchById } = require('../services/rapidCricketService');

exports.getLive = async (req, res) => {
    const sport = req.query.sport?.toLowerCase();
    // Strictly return Cricket, ignore football/others
    if (sport === 'football') return res.json({ status: 'success', data: [] });
    
    const cricketMatches = getCricketMatches();
    res.json({ status: 'success', data: cricketMatches });
};

// GET /api/live/cricket — all cricket matches (live + upcoming + completed)
exports.getCricketLive = async (req, res) => {
    const all = getCricketMatches();
    res.json({ status: 'success', data: all });
};

// GET /api/live/cricket/:id — single match detail
exports.getCricketMatchById = async (req, res) => {
    const match = getCachedMatchById(req.params.id);
    if (!match) return res.status(404).json({ status: 'error', message: 'Match not found' });
    res.json({ status: 'success', data: match });
};
