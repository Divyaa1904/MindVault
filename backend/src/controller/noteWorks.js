const Note = require("../models/note");
const ChatSession = require("../models/chatSession");
const generateEmbeddings = require("../utils/generateEmbeddings")
const keywordSearch = require("../utils/keywordSearch")
const vectorSearch = require("../utils/vectorSearch")
const mergeSearchResults = require("../utils/mergeSearchResults")
const { chat, transformQuery } = require("../utils/chat")

const createNote = async (req, res) => {
    try {
        const { title, content, plainText, tags } = req.body;

        const myString = `Title: ${title.trim()}
tags: ${tags.join(', ')}
content: ${plainText.trim()}`;

        const embedding = await generateEmbeddings(myString);
        const embeddings = (embedding.length > 0) ? embedding[0].values : [];

        const generatedNote = await Note.create({
            title,
            content,
            plainText,
            embeddings,
            tags,
            creator: req.user._id
        });
        res.status(201).json({
            message: "Note created successfully",
            note: generatedNote
        });
    }
    catch (err) {
        res.status(500).send("Error: " + err);
    }
}

const getAllNotes = async (req, res) => {
    try {
        const notes = await Note.find({ creator: req.user._id }).select('_id title plainText tags updatedAt');
        res.status(200).send(notes);
    }
    catch (err) {
        res.status(500).send("Error: " + err);
    }
}

const getById = async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);
        if (!note)
            return res.status(404).send("Invalid NoteID");
        if (!note.creator.equals(req.user._id))
            return res.status(403).send("Unauthorized User");
        return res.status(200).send(note);
    }
    catch (err) {
        res.status(500).send("Error: " + err);
    }
}

const updateNote = async (req, res) => {
    try {
        const id = req.params.id;
        const note = await Note.findById(id);
        if (!note)
            return res.status(404).send("Invalid NoteID");
        if (!note.creator.equals(req.user._id))
            return res.status(403).send("Unauthorized User");

        const myString = `Title: ${req.body.title.trim()}
tags: ${req.body.tags.join(', ')}
content: ${req.body.plainText.trim()}`;

        const embedding = await generateEmbeddings(myString);
        const embeddings = (embedding.length > 0) ? embedding[0].values : [];

        const newNote = await Note.findByIdAndUpdate(id, { ...req.body, embeddings }, { runValidators: true, returnDocument: "after" });

        res.status(200).send(newNote);
    }
    catch (err) {
        res.status(500).send("Error: " + err);
    }
}

const deleteNote = async (req, res) => {
    try {
        const id = req.params.id;
        const note = await Note.findById(id);
        if (!note)
            return res.status(404).send("Invalid NoteID");
        if (!note.creator.equals(req.user._id))
            return res.status(403).send("Unauthorized User");
        await Note.findByIdAndDelete(id);
        return res.status(200).send("Note deleted");
    }
    catch (err) {
        return res.status(500).send("Error: " + err);
    }
}

const search = async (req, res) => {
    const query = req.body.query?.trim();

    if (!query) {
        return res.status(400).json({
            message: "Query is required."
        });
    }
    try {
        const [keywordResults, queryEmbedding] = await Promise.all([
            keywordSearch(query, req.user._id),
            generateEmbeddings(query)
        ]);
        const semanticResults = await vectorSearch(queryEmbedding[0].values, req.user._id);

        const finalResults = mergeSearchResults(keywordResults, semanticResults);

        return res.status(200).send(finalResults);
    }
    catch (err) {
        return res.status(500).send("Error: " + err);
    }
}

const aiChat = async (req, res) => {
    const question = req.body.question?.trim();
    const sessionId = req.body.sessionId;

    if (!question) {
        return res.status(400).json({
            message: "Question is required"
        });
    }
    try {
        const enhancedQuestion = await transformQuery(question);

        const questionEmbedding = await generateEmbeddings(question);

        const semanticResults = await vectorSearch(questionEmbedding[0].values, req.user._id);

        const context = semanticResults
            .map(note => `${note.title}\n${note.plainText}`)
            .join("\n\n------------\n\n");
        const response = await chat(enhancedQuestion, context);

        const citations = semanticResults.map(note => ({ _id: note._id, title: note.title }));

        let session;
        if (sessionId) {
            session = await ChatSession.findById(sessionId);
            if (session && !session.userId.equals(req.user._id)) {
                return res.status(403).json({ message: "Unauthorized User" });
            }
        }
        
        if (!session) {
            session = new ChatSession({
                userId: req.user._id,
                title: question.substring(0, 40) + (question.length > 40 ? '...' : ''),
                messages: []
            });
        }
        
        session.messages.push({ role: 'user', content: question, citations: [] });
        session.messages.push({ role: 'assistant', content: response, citations });
        await session.save();

        return res.status(200).send({ answer: response, citations, sessionId: session._id });
    }
    catch (err) {
        return res.status(500).send("Error: " + err);
    }
}

const summarizeNote = async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);
        if (!note)
            return res.status(404).send("Invalid NoteID");
        if (!note.creator.equals(req.user._id))
            return res.status(403).send("Unauthorized User");

        const { GoogleGenAI } = require("@google/genai");
        const ai = new GoogleGenAI({});

        const noteContent = `Title: ${note.title}\nTags: ${note.tags?.join(', ') || 'None'}\nContent: ${note.plainText}`;

        const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: [{ role: 'user', parts: [{ text: noteContent }] }],
            config: {
                systemInstruction: `You are a note summarization assistant. Given a note's title, tags, and content, produce a clear, concise summary that captures the key points. 

Rules:
1. Keep the summary between 2-5 sentences.
2. Highlight the most important ideas, facts, or action items.
3. Use bullet points if the note covers multiple distinct topics.
4. Do not add information that is not in the note.
5. Write in a professional but friendly tone.`
            }
        });

        return res.status(200).json({ summary: response.text });
    }
    catch (err) {
        return res.status(500).send("Error: " + err);
    }
}

const parsePdf = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No PDF file uploaded" });
        }

        const pdfParse = require("pdf-parse");
        const data = await pdfParse(req.file.buffer);

        const title = req.file.originalname.replace(/\.pdf$/i, "");
        const content = data.text;

        return res.status(200).json({ title, content });
    } catch (err) {
        return res.status(500).send("Error parsing PDF: " + err);
    }
}

const getChatSessions = async (req, res) => {
    try {
        const sessions = await ChatSession.find({ userId: req.user._id })
            .select('_id title updatedAt')
            .sort({ updatedAt: -1 });
        res.status(200).send(sessions);
    } catch (err) {
        res.status(500).send("Error: " + err);
    }
}

const getChatSessionById = async (req, res) => {
    try {
        const session = await ChatSession.findById(req.params.id);
        if (!session) return res.status(404).send("Session not found");
        if (!session.userId.equals(req.user._id)) return res.status(403).send("Unauthorized User");
        res.status(200).send(session);
    } catch (err) {
        res.status(500).send("Error: " + err);
    }
}

const getSharedNote = async (req, res) => {
    try {
        const note = await Note.findById(req.params.id).select('-creator');
        if (!note) return res.status(404).send("Note not found");
        return res.status(200).send(note);
    } catch (err) {
        res.status(500).send("Error: " + err);
    }
}

const downloadSharedNote = async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);
        if (!note) return res.status(404).send("Note not found");

        const newNote = await Note.create({
            title: note.title + " (Shared)",
            content: note.content,
            plainText: note.plainText,
            embeddings: note.embeddings,
            tags: note.tags,
            creator: req.user._id
        });
        res.status(201).json({ message: "Note downloaded successfully", note: newNote });
    } catch (err) {
        res.status(500).send("Error: " + err);
    }
}

module.exports = { createNote, getAllNotes, getById, updateNote, deleteNote, search, aiChat, summarizeNote, parsePdf, getChatSessions, getChatSessionById, getSharedNote, downloadSharedNote };
