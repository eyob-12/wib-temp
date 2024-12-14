const Conversations = require('../models/conversation');
const Users = require('../models/User');

// Get all conversations for a user
const getConversations = async (req, res) => {
    try {
        const userId = req.params.userId;

        const conversations = await Conversations.find({ members: { $in: [userId] } });

        const conversationUserData = await Promise.all(
            conversations.map(async (conversation) => {
                const receiverId = conversation.members.find((member) => member !== userId);
                const user = await Users.findById(receiverId);
                return {
                    user: {
                        receiverId: user._id,
                        email: user.email,
                        fullName: user.fullName,
                    },
                    conversationId: conversation._id,
                };
            })
        );

        res.status(200).json(conversationUserData);
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { getConversations };
