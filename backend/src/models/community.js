const mongoose = require('mongoose');
const { Schema } = mongoose;

const communitySchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minLength: 2,
        maxLength: 50
    },
    description: {
        type: String,
        required: true,
        maxLength: 500
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    members: [{
        type: Schema.Types.ObjectId,
        ref: "user"
    }]
}, { timestamps: true });

const Community = mongoose.model("community", communitySchema);
module.exports = Community;
