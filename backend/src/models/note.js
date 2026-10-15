const mongoose=require('mongoose');
const {Schema}=mongoose;
const noteSchema=new Schema({
    title:{
        type:String,
        required:true
    },
    content:{
        type:Schema.Types.Mixed
    },
    plainText:{
        type:String
    },
    embeddings:{
        type:[Number],
        default: []
    },
    tags:{
        type: [String],
        default: []
    },
    creator:{
        type:Schema.Types.ObjectId,
        ref:"user"
    }
},{timestamps:true});

noteSchema.index({
    creator: 1,
    updatedAt: -1
});


const Note=mongoose.model("note",noteSchema);
module.exports=Note;