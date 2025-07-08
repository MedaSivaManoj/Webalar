const User = require('../models/user');
const Task = require('../models/Task');
const crypto = require('crypto');

// Toggle board sharing
exports.shareBoard = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.isPublic = !user.isPublic; // Toggle the public status

        if (user.isPublic && !user.publicId) {
            // Generate a unique publicId if it doesn't exist
            user.publicId = crypto.randomBytes(16).toString('hex');
        }

        await user.save();

        res.json({
            isPublic: user.isPublic,
            publicId: user.publicId,
        });
    } catch (error) {
        console.error('Error sharing board:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get public board data
exports.getPublicBoard = async (req, res) => {
    try {
        const { publicId } = req.params;
        const user = await User.findOne({ publicId, isPublic: true });

        if (!user) {
            return res.status(404).json({ message: 'Public board not found or sharing is disabled' });
        }

        const tasks = await Task.find({ user: user._id }).populate('assignedTo', 'username email');

        res.json({
            user: { username: user.username },
            tasks,
        });
    } catch (error) {
        console.error('Error getting public board:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get sharing status
exports.getShareStatus = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('isPublic publicId');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({
            isPublic: user.isPublic,
            publicId: user.publicId,
        });
    } catch (error) {
        console.error('Error getting share status:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
