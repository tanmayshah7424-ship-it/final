const Match = require('../models/Match');
const Team = require('../models/Team');
const Player = require('../models/Player');
const Series = require('../models/Series');
const cricApiService = require('./rapidCricketService');

class SearchService {
    async search(query) {
        if (!query || query.length < 2) return { live: [], upcoming: [], finished: [], teams: [], players: [], series: [] };

        const regex = new RegExp(query, 'i');

        // 1. Find matching teams first to handle match searches by team name
        const matchingTeams = await Team.find({ sport: 'cricket', $or: [{ name: regex }, { shortName: regex }] }).select('_id').lean();
        const teamIds = matchingTeams.map(t => t._id);

        // 2. Parallel Local Search
        const [matches, teams, players, series] = await Promise.all([
            Match.find({
                sport: 'cricket',
                $or: [
                    { teamA: { $in: teamIds } },
                    { teamB: { $in: teamIds } },
                    { tournament: regex },
                    { venue: regex },
                    { summary: regex }
                ]
            }).populate('teamA teamB').limit(20).lean(),
            Team.find({ sport: 'cricket', $or: [{ name: regex }, { shortName: regex }] }).limit(10).lean(),
            Player.find({ name: regex }).populate({
                path: 'teamId',
                match: { sport: 'cricket' }
            }).limit(20).lean().then(players => players.filter(p => p.teamId)), // Filter players whose team matches cricket
            Series.find({ name: regex }).limit(5).lean()
        ]);

        // 2. Fallback to CricAPI if local results are sparse
        if (matches.length < 3 || players.length < 3) {
            // Trigger background fetch, don't await to keep response fast
            this.fetchAndCacheExternal(query).catch(err => console.error('Background fetch error:', err.message));
        }

        // 3. Categorize Matches
        const live = matches.filter(m => m.status === 'live');
        const upcoming = matches.filter(m => m.status === 'upcoming');
        const finished = matches.filter(m => m.status === 'completed');

        return {
            live,
            upcoming,
            finished,
            teams,
            players,
            series
        };
    }

    async fetchAndCacheExternal(query) {
        console.log(`🌍 Fetching external data for: ${query}`);
        try {
            // Logic to call cricApiService and store results
            // This relies on cricApiService having a search method, or adapting existing ones
            // For now, we'll assume cricApiService handles specific functional calls
            // Implementation of complex caching logic would go here
        } catch (error) {
            console.error('External fetch failed:', error.message);
        }
    }

    async suggest(query) {
        if (!query) return [];
        const regex = new RegExp(query, 'i');

        const teams = await Team.find({ sport: 'cricket', name: regex }).select('name logo sport').limit(3).lean();
        const players = await Player.find({ name: regex }).populate({
            path: 'teamId',
            match: { sport: 'cricket' }
        }).select('name teamId role').limit(10).lean().then(players => players.filter(p => p.teamId).slice(0, 3));

        return [
            ...teams.map(t => ({ type: 'team', text: t.name, id: t._id, logo: t.logo })),
            ...players.map(p => ({ type: 'player', text: p.name, id: p._id }))
        ];
    }
}

module.exports = new SearchService();
