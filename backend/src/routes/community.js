const express = require('express');
const router = express.Router();
const userMiddleware = require('../middleware/userMiddleware');
const communityController = require('../controller/communityController');

// All community routes require authentication
router.use(userMiddleware);

// Community CRUD and search
router.post('/', communityController.createCommunity);
router.get('/', communityController.getAllCommunities);
router.get('/:id', communityController.getCommunityDetails);

// Membership
router.post('/:id/join', communityController.joinCommunity);
router.post('/:id/leave', communityController.leaveCommunity);

// Knowledge Sharing
router.post('/:id/share', communityController.shareNote);
router.get('/:id/notes', communityController.getCommunityKnowledge);

module.exports = router;
