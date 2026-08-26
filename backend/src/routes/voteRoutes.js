const express = require("express");
const { castVote } = require("../controllers/voteController");
const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/:pollId", authenticate, castVote);

module.exports = router;
