const path = require("path");
require('dotenv').config();

const express = require('express');
const http = require('http');
const cors = require('cors');

const connectDB = require('./config/db');
const { initSocket } = require('./socket');
const errorHandler = require('./middleware/errorHandler');

const sportsDbService = require('./services/sportsDbService');
const cricApiService = require('./services/rapidCricketService');

const app = express();
const server = http.createServer(app);

// Init Socket.IO
initSocket(server);

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
}));

app.use(express.json());

// ================= FRONTEND SERVING =================

const frontendPath = path.join(__dirname, '../frontend/dist');

// Serve static frontend files
app.use(express.static(frontendPath));

// ================= API ROUTES =================

app.use('/api/auth', require('./routes/auth'));
app.use('/api/teams', require('./routes/teams'));
app.use('/api/players', require('./routes/players'));
app.use('/api/matches', require('./routes/matches'));
app.use('/api/commentary', require('./routes/commentary'));
app.use('/api/favorites', require('./routes/favorites'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/live', require('./routes/live'));
app.use('/api/player', require('./routes/player'));
app.use('/api/system', require('./routes/system'));
app.use('/api/search', require('./routes/search'));
app.use('/api/cricbuzz', require('./routes/cricbuzz'));
app.use('/api/ai', require('./routes/ai'));

// Health Check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        time: new Date()
    });
});

// ================= REACT FRONTEND ROUTE =================

// Important: Must be AFTER API routes
app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// ================= ERROR HANDLER =================

app.use(errorHandler);

const PORT = process.env.PORT || 5001;

// ================= SUPERADMIN =================

const ensureSuperadmin = async () => {
    const User = require('./models/User');
    const superadminEmail = 'tanmayshah7424@gmail.com';

    try {
        let superadmin = await User.findOne({ email: superadminEmail });

        if (!superadmin) {
            superadmin = await User.create({
                name: 'Superadmin',
                email: superadminEmail,
                password: process.env.SUPERADMIN_PASSWORD || 'Tanmay7424@',
                role: 'superadmin'
            });

            console.log('✅ Superadmin account created:', superadminEmail);

        } else if (superadmin.role !== 'superadmin') {

            superadmin.role = 'superadmin';
            await superadmin.save();

            console.log('✅ Superadmin role restored for:', superadminEmail);

        } else {

            console.log('✅ Superadmin account exists:', superadminEmail);
        }

    } catch (error) {

        console.error('❌ Error ensuring superadmin:', error.message);
    }
};

// ================= SERVER START =================

const start = async () => {
    try {

        await connectDB();

        await ensureSuperadmin();

        if (process.env.NODE_ENV !== 'test') {

            server.listen(PORT, '0.0.0.0', () => {

                console.log(`🚀 Server running on port ${PORT}`);
                console.log(`📡 Socket.IO ready`);

                // Start CricAPI polling
                cricApiService.start();

            });
        }

    } catch (err) {

        console.error("Server startup error:", err);
    }
};

// Auto Start
if (require.main === module) {
    start();
}

module.exports = {
    app,
    server,
    start,
    connectDB
};