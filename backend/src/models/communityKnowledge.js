const mongoose = require('mongoose');
const { Schema } = mongoose;

const communityKnowledgeSchema = new Schema({
    community: {
        type: Schema.Types.ObjectId,
        ref: "community",
        required: true
    },
    note: {
        type: Schema.Types.ObjectId,
        ref: "note",
        required: true
    },
    sharedBy: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true
    }
}, { timestamps: true });

const CommunityKnowledge = mongoose.model("communityKnowledge", communityKnowledgeSchema);
module.exports = CommunityKnowledge;
