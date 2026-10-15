const express=require('express')
const noteRouter=express.Router();
const multer = require('multer');
const {createNote, getAllNotes, getById, updateNote, deleteNote,search,aiChat,summarizeNote,parsePdf, getChatSessions, getChatSessionById, getSharedNote, downloadSharedNote}=require('../controller/noteWorks');
const userMiddleware=require('../middleware/userMiddleware');

const upload = multer({ storage: multer.memoryStorage() });

noteRouter.post('/create',userMiddleware,createNote);
noteRouter.get('/getAll',userMiddleware,getAllNotes);
noteRouter.get('/getById/:id',userMiddleware,getById);
noteRouter.put('/update/:id',userMiddleware,updateNote);
noteRouter.delete('/delete/:id',userMiddleware,deleteNote);
noteRouter.post('/search', userMiddleware, search);
noteRouter.post('/chat', userMiddleware, aiChat);
noteRouter.get('/chat/sessions', userMiddleware, getChatSessions);
noteRouter.get('/chat/sessions/:id', userMiddleware, getChatSessionById);
noteRouter.get('/summarize/:id', userMiddleware, summarizeNote);
noteRouter.post('/parse-pdf', userMiddleware, upload.single('pdf'), parsePdf);
noteRouter.get('/shared/:id', userMiddleware, getSharedNote);
noteRouter.post('/download/:id', userMiddleware, downloadSharedNote);

module.exports=noteRouter;