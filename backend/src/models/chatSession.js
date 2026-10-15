const mongoose = require('mongoose');

const chatSessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        default: 'New Chat'
    },
    messages: [{
        role: {
            type: String,
            enum: ['user', 'assistant'],
            required: true
        },
        content: {
            type: String,
            required: true
        },
        citations: [{
            _id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Note'
            },
            title: String
        }]
    }]
}, { timestamps: true });

module.exports = mongoose.model('ChatSession', chatSessionSchema);
