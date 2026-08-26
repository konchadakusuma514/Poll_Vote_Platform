const { PrismaClient } = require("@prisma/client");
const { formatPollData } = require("./pollController");

const prisma = new PrismaClient();

const castVote = async (req, res) => {
  try {
    const { pollId } = req.params;
    let { optionIds } = req.body; // Can be single string or array of strings
    const userId = req.user.id;

    if (!optionIds) {
      return res.status(400).json({ message: "Please select an option to vote." });
    }

    if (!Array.isArray(optionIds)) {
      optionIds = [optionIds];
    }

    if (optionIds.length === 0) {
      return res.status(400).json({ message: "Please select at least one option." });
    }

    // Fetch poll with existing votes
    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: {
        creator: { select: { id: true, name: true, avatar: true } },
        options: { include: { votes: true } }
      }
    });

    if (!poll) {
      return res.status(404).json({ message: "Poll not found." });
    }

    // Check if poll is closed or expired
    const now = new Date();
    if (poll.isClosed || (poll.expiresAt && new Date(poll.expiresAt) <= now)) {
      return res.status(400).json({ message: "This poll is closed or has expired. Voting is disabled." });
    }

    // Check if single choice poll but user submitted multiple options
    if (!poll.isMultiple && optionIds.length > 1) {
      return res.status(400).json({ message: "This poll only allows selecting a single option." });
    }

    // Check if user has already voted on this poll
    const existingUserVotes = await prisma.vote.findMany({
      where: {
        pollId,
        userId
      }
    });

    if (existingUserVotes.length > 0) {
      return res.status(400).json({ message: "You have already voted on this poll! Duplicate voting is prevented." });
    }

    // Validate that all optionIds belong to this poll
    const validOptionIds = poll.options.map((opt) => opt.id);
    const areValid = optionIds.every((id) => validOptionIds.includes(id));
    if (!areValid) {
      return res.status(400).json({ message: "Invalid option selected for this poll." });
    }

    // Record votes atomically in database
    await prisma.$transaction(
      optionIds.map((optId) =>
        prisma.vote.create({
          data: {
            pollId,
            optionId: optId,
            userId
          }
        })
      )
    );

    // Fetch fresh updated poll data
    const updatedPoll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: {
        creator: { select: { id: true, name: true, avatar: true } },
        options: { include: { votes: true } }
      }
    });

    const formatted = formatPollData(updatedPoll, userId);

    // Emit real-time event via Socket.io
    const io = req.app.get("io");
    if (io) {
      // Broadcast to poll room and general channel
      io.to(`poll_${pollId}`).emit("vote_update", {
        pollId,
        poll: formatPollData(updatedPoll, null) // Public view for others
      });
      io.emit("poll_activity", {
        pollId,
        totalVotes: formatted.totalVotes
      });
    }

    return res.status(200).json({
      message: "Vote cast successfully!",
      poll: formatted
    });
  } catch (error) {
    console.error("CastVote error:", error);
    if (error.code === "P2002") {
      return res.status(400).json({ message: "Duplicate vote detected. You cannot vote twice." });
    }
    return res.status(500).json({ message: "An error occurred while submitting your vote." });
  }
};

module.exports = { castVote };
