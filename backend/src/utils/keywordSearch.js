const Note=require("../models/note");

const keywordSearch=async (query,id)=>{
    try{
        const notes=await Note.find({creator:id}).select('_id title plainText tags');

        const filteredNotes = notes.filter(note =>
            note.title.toLowerCase().includes(query.toLowerCase()) ||
            note.plainText.toLowerCase().includes(query.toLowerCase()) ||
            note.tags.some(tag =>
                tag.toLowerCase().includes(query.toLowerCase())
            )
        );
        return filteredNotes;
    }
    catch(err){
        console.error("Error: "+err);
    }
}
module.exports=keywordSearch;