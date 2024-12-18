const Conversations = require('../models/conversation');
const Messages = require('../models/message');
const Users = require('../models/User');

// Send a message
const sendMessage = async (req, res) => {
    try {
        const { conversationId, senderId, message, receiverId = '' } = req.body;

        if (!senderId || !message) {
            return res.status(400).send('Please fill all required fields');
        }

        if (conversationId === 'new' && receiverId) {
            const newConversation = new Conversations({ members: [senderId, receiverId] });
            await newConversation.save();

            const newMessage = new Messages({
                conversationId: newConversation._id,
                senderId,
                message,
            });

            await newMessage.save();
            return res.status(200).send('Message sent successfully');
        } else if (!conversationId && !receiverId) {
            return res.status(400).send('Please fill all required fields');
        }

        const newMessage = new Messages({
            conversationId,
            senderId,
            message,
        });

        await newMessage.save();
        res.status(200).send('Message sent successfully');
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get all messages in a conversation
const getMessages = async (req, res) => {
    try {
        const checkMessages = async (conversationId) => {
            const messages = await Messages.find({ conversationId });
            return await Promise.all(
                messages.map(async (message) => {
                    const user = await Users.findById(message.senderId);
                    return {
                        user: {
                            id: user._id,
                            email: user.email,
                            fullName: user.fullName,
                        },
                        message: message.message,
                    };
                })
            );
        };

        const conversationId = req.params.conversationId;

        if (conversationId === 'new') {
            const checkConversation = await Conversations.find({
                members: { $all: [req.query.senderId, req.query.receiverId] },
            });

            if (checkConversation.length > 0) {
                const messageData = await checkMessages(checkConversation[0]._id);
                return res.status(200).json(messageData);
            } else {
                return res.status(200).json([]);
            }
        } else {
            const messageData = await checkMessages(conversationId);
            res.status(200).json(messageData);
        }
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { sendMessage, getMessages };
