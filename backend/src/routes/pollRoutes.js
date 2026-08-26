const express = require("express");
const {
  createPoll,
  getAllPolls,
  getPollById,
  getUserPolls,
  getUserVotedPolls,
  toggleClosePoll,
  deletePoll,
  getPlatformStats
} = require("../controllers/pollController");
const { authenticate, optionalAuth } = require("../middleware/authMiddleware");

const router = express.Router();

// Public / optional auth routes
router.get("/", optionalAuth, getAllPolls);
router.get("/stats", getPlatformStats);
router.get("/user/created", authenticate, getUserPolls);
router.get("/user/voted", authenticate, getUserVotedPolls);
router.get("/:id", optionalAuth, getPollById);

// Protected routes
router.post("/", authenticate, createPoll);
router.patch("/:id/toggle-close", authenticate, toggleClosePoll);
router.delete("/:id", authenticate, deletePoll);

module.exports = router;
