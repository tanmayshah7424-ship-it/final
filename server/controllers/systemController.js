const System = require('../config/systemConfig');

exports.getSettings = async (req, res, next) => {
    try {
        res.json({
            apiMode: System.apiMode,
            notificationCount: System.notifications.length
        });
    } catch (error) {
        next(error);
    }
};

exports.updateSettings = async (req, res, next) => {
    try {
        const { apiMode } = req.body;

        if (apiMode && ['api', 'manual'].includes(apiMode)) {
            System.apiMode = apiMode;
        }

        res.json({ message: 'Settings updated successfully', apiMode: System.apiMode });
    } catch (error) {
        next(error);
    }
};

exports.broadcastNotification = async (req, res, next) => {
    try {
        const { message, type = 'info' } = req.body;

        if (!message) {
            return res.status(400).json({ message: 'Notification message is required' });
        }

        const notification = {
            id: Date.now(),
            message,
            type,
            timestamp: new Date()
        };

        System.notifications.push(notification);

        // Emit via socket if available
        if (req.app.get('io')) {
            req.app.get('io').emit('systemNotification', notification);
        }

        res.json({ message: 'Notification broadcasted successfully', notification });
    } catch (error) {
        next(error);
    }
};
