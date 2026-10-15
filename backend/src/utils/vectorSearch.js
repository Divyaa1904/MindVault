const Note=require("../models/note");
const mongoose = require("mongoose");

const vectorSearch= async(query,id)=>{
    try{
        const results = await Note.aggregate([
        {
            $vectorSearch: {
            index: "vector_index",
            path: "embeddings",
            queryVector: query,
            numCandidates: 100,
            limit: 3,
            filter: {
                creator: new mongoose.Types.ObjectId(id)
            }
            }
        },
        {
            $project: {
            title: 1,
            plainText: 1,
            tags: 1,
            updatedAt: 1,
            score: {
                $meta: "vectorSearchScore"
            }
            }
        }
        ]);
        return results;
    }
    catch(err){
        console.error("Error: "+err);
    }
}
module.exports= vectorSearch;
