const Community = require('../models/community');
const CommunityKnowledge = require('../models/communityKnowledge');
const Note = require('../models/note');
const mongoose = require('mongoose');

exports.createCommunity = async (req, res) => {
    try {
        const { name, description } = req.body;
        const userId = req.user._id;

        if (!name || !description) {
            return res.status(400).json({ error: "Name and description are required" });
        }

        const existing = await Community.findOne({ name });
        if (existing) {
            return res.status(400).json({ error: "Community name already taken" });
        }

        const newCommunity = new Community({
            name,
            description,
            creator: userId,
            members: [userId]
        });

        await newCommunity.save();
        res.status(201).json(newCommunity);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAllCommunities = async (req, res) => {
    try {
        const { search } = req.query;
        let filter = {};
        if (search) {
            filter.name = { $regex: search, $options: 'i' };
        }

        const communities = await Community.find(filter)
            .select('name description members creator createdAt')
            .populate('creator', 'firstName lastName')
            .sort({ createdAt: -1 });

        res.status(200).json(communities);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getCommunityDetails = async (req, res) => {
    try {
        const { id } = req.params;

        const community = await Community.findById(id)
            .populate('creator', 'firstName lastName emailId')
            .populate('members', 'firstName lastName emailId');

        if (!community) {
            return res.status(404).json({ error: "Community not found" });
        }

        res.status(200).json(community);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.joinCommunity = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const community = await Community.findById(id);
        if (!community) {
            return res.status(404).json({ error: "Community not found" });
        }

        if (community.members.includes(userId)) {
            return res.status(400).json({ error: "Already a member" });
        }

        community.members.push(userId);
        await community.save();

        res.status(200).json({ message: "Joined successfully", community });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.leaveCommunity = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const community = await Community.findById(id);
        if (!community) {
            return res.status(404).json({ error: "Community not found" });
        }

        if (community.creator.toString() === userId.toString()) {
            return res.status(400).json({ error: "Creator cannot leave the community. Delete it instead." });
        }

        community.members = community.members.filter(mId => mId.toString() !== userId.toString());
        await community.save();

        res.status(200).json({ message: "Left successfully", community });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.shareNote = async (req, res) => {
    try {
        const { id: communityId } = req.params;
        const { noteId } = req.body;
        const userId = req.user._id;

        const community = await Community.findById(communityId);
        if (!community) {
            return res.status(404).json({ error: "Community not found" });
        }

        if (!community.members.includes(userId)) {
            return res.status(403).json({ error: "You must be a member to share notes" });
        }

        const note = await Note.findById(noteId);
        if (!note || note.creator.toString() !== userId.toString()) {
            return res.status(404).json({ error: "Note not found or unauthorized" });
        }

        const existingShared = await CommunityKnowledge.findOne({ community: communityId, note: noteId });
        if (existingShared) {
            return res.status(400).json({ error: "Note already shared in this community" });
        }

        const sharedKnowledge = new CommunityKnowledge({
            community: communityId,
            note: noteId,
            sharedBy: userId
        });

        await sharedKnowledge.save();
        res.status(201).json({ message: "Note shared successfully", sharedKnowledge });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getCommunityKnowledge = async (req, res) => {
    try {
        const { id: communityId } = req.params;

        const knowledge = await CommunityKnowledge.find({ community: communityId })
            .populate('sharedBy', 'firstName lastName')
            .populate({
                path: 'note',
                select: 'title plainText tags updatedAt'
            })
            .sort({ createdAt: -1 });

        // Filter out knowledge where note is null (e.g., if original note was deleted)
        const validKnowledge = knowledge.filter(k => k.note != null);

        res.status(200).json(validKnowledge);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
