const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
    sport: { type: String, enum: ['cricket', 'football', 'basketball', 'tennis'], required: true },
    tournament: { type: String, required: true },
    status: { type: String, enum: ['live', 'upcoming', 'completed'], default: 'upcoming' },
    venue: { type: String, required: true },
    date: { type: Date, required: true },
    teamA: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    teamB: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    scoreA: { type: String, default: '-' },
    scoreB: { type: String, default: '-' },
    summary: { type: String, default: '' },
    name: { type: String }, // For ingestion parity
    shortName: { type: String }, // For ingestion parity
    overs: { type: String },
    minute: { type: String },
    espnId: { type: String, unique: true, sparse: true }, // Legacy External ID
    externalId: { type: String, sparse: true }, // Generic External ID
    externalProvider: { type: String, enum: ['cricapi', 'thesportsdb', 'espn', 'api-sports'], sparse: true },
}, { timestamps: true });

// Index for quick lookup during ingestion
matchSchema.index({ externalId: 1, externalProvider: 1 }, { unique: true, sparse: true });

// Text index for search
matchSchema.index({ tournament: 'text', venue: 'text', summary: 'text' });

module.exports = mongoose.model('Match', matchSchema);
