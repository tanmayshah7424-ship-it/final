const Team = require('../models/Team');
const Player = require('../models/Player');

const Match = require('../models/Match');

exports.getAll = async (req, res, next) => {
    try {
        const { sport } = req.query;
        const filter = { sport: 'cricket' }; // Default to cricket only
        if (sport) filter.sport = sport;

        const teams = await Team.find(filter).sort({ name: 1 });
        res.json(teams);
    } catch (error) {
        next(error);
    }
};

exports.getById = async (req, res, next) => {
    try {
        const team = await Team.findById(req.params.id);
        if (!team) return res.status(404).json({ message: 'Team not found' });

        // Parallel fetching for performance
        const [players, matches] = await Promise.all([
            Player.find({ teamId: team._id }),
            Match.find({
                $or: [{ teamA: team._id }, { teamB: team._id }]
            }).populate('teamA teamB').sort({ date: -1 }).limit(10) // Get last 10 matches
        ]);

        // Categorize matches
        const live = matches.filter(m => m.status === 'live');
        const upcoming = matches.filter(m => m.status === 'upcoming');
        const recent = matches.filter(m => m.status === 'completed');

        res.json({
            ...team.toObject(),
            playersList: players,
            matches: {
                live,
                upcoming,
                recent
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.create = async (req, res, next) => {
    try {
        const team = await Team.create(req.body);
        res.status(201).json(team);
    } catch (error) {
        next(error);
    }
};

exports.update = async (req, res, next) => {
    try {
        const team = await Team.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!team) return res.status(404).json({ message: 'Team not found' });
        res.json(team);
    } catch (error) {
        next(error);
    }
};

exports.remove = async (req, res, next) => {
    try {
        const team = await Team.findByIdAndDelete(req.params.id);
        if (!team) return res.status(404).json({ message: 'Team not found' });
        res.json({ message: 'Team deleted' });
    } catch (error) {
        next(error);
    }
};
