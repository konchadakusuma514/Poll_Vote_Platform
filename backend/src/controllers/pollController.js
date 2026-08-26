const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Helper to format poll and calculate stats & check expiry
const formatPollData = (poll, currentUserId = null) => {
  const now = new Date();
  const isExpired = poll.expiresAt ? new Date(poll.expiresAt) < now : false;
  const isClosed = poll.isClosed || isExpired;

  // Calculate total votes across all options
  const totalVotes = poll.options.reduce((sum, opt) => sum + (opt.votes ? opt.votes.length : 0), 0);

  // Determine if current user has voted and which options they chose
  let hasVoted = false;
  let userVotedOptionIds = [];

  if (currentUserId) {
    poll.options.forEach((opt) => {
      if (opt.votes && opt.votes.some((v) => v.userId === currentUserId)) {
        hasVoted = true;
        userVotedOptionIds.push(opt.id);
      }
    });
  }

  const options = poll.options.map((opt) => {
    const voteCount = opt.votes ? opt.votes.length : 0;
    const percentage = totalVotes > 0 ? ((voteCount / totalVotes) * 100).toFixed(1) : 0;
    return {
      id: opt.id,
      text: opt.text,
      voteCount,
      percentage: Number(percentage)
    };
  });

  return {
    id: poll.id,
    title: poll.title,
    description: poll.description,
    category: poll.category,
    isPrivate: poll.isPrivate,
    isMultiple: poll.isMultiple,
    hasAccessCode: Boolean(poll.accessCode),
    expiresAt: poll.expiresAt,
    isClosed,
    isExpired,
    createdAt: poll.createdAt,
    creator: poll.creator
      ? {
          id: poll.creator.id,
          name: poll.creator.name,
          avatar: poll.creator.avatar
        }
      : null,
    totalVotes,
    options,
    hasVoted,
    userVotedOptionIds
  };
};

const createPoll = async (req, res) => {
  try {
    const { title, description, category, options, isPrivate, isMultiple, accessCode, expiresAt } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Poll title is required." });
    }

    if (!Array.isArray(options) || options.filter((opt) => opt && opt.trim()).length < 2) {
      return res.status(400).json({ message: "At least 2 non-empty options are required." });
    }

    const cleanOptions = options.map((opt) => opt.trim()).filter((opt) => opt.length > 0);

    let parsedExpiresAt = null;
    if (expiresAt) {
      parsedExpiresAt = new Date(expiresAt);
      if (isNaN(parsedExpiresAt.getTime()) || parsedExpiresAt <= new Date()) {
        return res.status(400).json({ message: "Expiry date must be in the future." });
      }
    }

    const poll = await prisma.poll.create({
      data: {
        title: title.trim(),
        description: description ? description.trim() : null,
        category: category || "General",
        isPrivate: Boolean(isPrivate),
        isMultiple: Boolean(isMultiple),
        accessCode: isPrivate && accessCode ? accessCode.trim() : null,
        expiresAt: parsedExpiresAt,
        creatorId: req.user.id,
        options: {
          create: cleanOptions.map((text) => ({ text }))
        }
      },
      include: {
        creator: { select: { id: true, name: true, avatar: true } },
        options: { include: { votes: true } }
      }
    });

    return res.status(201).json({
      message: "Poll created successfully!",
      poll: formatPollData(poll, req.user.id)
    });
  } catch (error) {
    console.error("CreatePoll error:", error);
    return res.status(500).json({ message: "Error creating poll." });
  }
};

const getAllPolls = async (req, res) => {
  try {
    const { category, status, search, sort } = req.query;
    const currentUserId = req.user ? req.user.id : null;

    const where = {
      isPrivate: false // Public polls only in main explore list
    };

    if (category && category !== "All") {
      where.category = category;
    }

    if (search && search.trim()) {
      where.OR = [
        { title: { contains: search.trim() } },
        { description: { contains: search.trim() } }
      ];
    }

    const now = new Date();
    if (status === "active") {
      where.isClosed = false;
      where.OR = [{ expiresAt: null }, { expiresAt: { gt: now } }];
    } else if (status === "closed" || status === "expired") {
      where.OR = [{ isClosed: true }, { expiresAt: { lte: now } }];
    }

    const rawPolls = await prisma.poll.findMany({
      where,
      include: {
        creator: { select: { id: true, name: true, avatar: true } },
        options: { include: { votes: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    let formatted = rawPolls.map((poll) => formatPollData(poll, currentUserId));

    // Custom sorting
    if (sort === "votes") {
      formatted.sort((a, b) => b.totalVotes - a.totalVotes);
    } else if (sort === "expiring") {
      formatted = formatted
        .filter((p) => p.expiresAt && !p.isClosed)
        .sort((a, b) => new Date(a.expiresAt) - new Date(b.expiresAt));
    }

    return res.json({ polls: formatted });
  } catch (error) {
    console.error("GetAllPolls error:", error);
    return res.status(500).json({ message: "Error fetching polls." });
  }
};

const getPollById = async (req, res) => {
  try {
    const { id } = req.params;
    const { code } = req.query;
    const currentUserId = req.user ? req.user.id : null;

    const poll = await prisma.poll.findUnique({
      where: { id },
      include: {
        creator: { select: { id: true, name: true, avatar: true } },
        options: {
          include: {
            votes: {
              include: { user: { select: { id: true, name: true, avatar: true } } }
            }
          }
        }
      }
    });

    if (!poll) {
      return res.status(404).json({ message: "Poll not found." });
    }

    // Check private access code if required
    if (poll.isPrivate && poll.accessCode) {
      const isCreator = currentUserId && currentUserId === poll.creatorId;
      const isAdmin = req.user && req.user.role === "ADMIN";
      if (!isCreator && !isAdmin && code !== poll.accessCode) {
        return res.status(403).json({
          message: "Access code required to view this private poll.",
          isPrivate: true,
          requireCode: true
        });
      }
    }

    return res.json({ poll: formatPollData(poll, currentUserId) });
  } catch (error) {
    console.error("GetPollById error:", error);
    return res.status(500).json({ message: "Error fetching poll details." });
  }
};

const getUserPolls = async (req, res) => {
  try {
    const polls = await prisma.poll.findMany({
      where: { creatorId: req.user.id },
      include: {
        creator: { select: { id: true, name: true, avatar: true } },
        options: { include: { votes: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    return res.json({
      polls: polls.map((p) => formatPollData(p, req.user.id))
    });
  } catch (error) {
    console.error("GetUserPolls error:", error);
    return res.status(500).json({ message: "Error fetching user polls." });
  }
};

const getUserVotedPolls = async (req, res) => {
  try {
    const userVotes = await prisma.vote.findMany({
      where: { userId: req.user.id },
      select: { pollId: true },
      distinct: ["pollId"]
    });

    const pollIds = userVotes.map((v) => v.pollId);

    const polls = await prisma.poll.findMany({
      where: { id: { in: pollIds } },
      include: {
        creator: { select: { id: true, name: true, avatar: true } },
        options: { include: { votes: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    return res.json({
      polls: polls.map((p) => formatPollData(p, req.user.id))
    });
  } catch (error) {
    console.error("GetUserVotedPolls error:", error);
    return res.status(500).json({ message: "Error fetching voted polls." });
  }
};

const toggleClosePoll = async (req, res) => {
  try {
    const { id } = req.params;

    const poll = await prisma.poll.findUnique({ where: { id } });
    if (!poll) return res.status(404).json({ message: "Poll not found." });

    if (poll.creatorId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Unauthorized to update this poll." });
    }

    const updated = await prisma.poll.update({
      where: { id },
      data: { isClosed: !poll.isClosed },
      include: {
        creator: { select: { id: true, name: true, avatar: true } },
        options: { include: { votes: true } }
      }
    });

    return res.json({
      message: updated.isClosed ? "Poll closed successfully." : "Poll reopened successfully.",
      poll: formatPollData(updated, req.user.id)
    });
  } catch (error) {
    console.error("ToggleClosePoll error:", error);
    return res.status(500).json({ message: "Error toggling poll status." });
  }
};

const deletePoll = async (req, res) => {
  try {
    const { id } = req.params;

    const poll = await prisma.poll.findUnique({ where: { id } });
    if (!poll) return res.status(404).json({ message: "Poll not found." });

    if (poll.creatorId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Unauthorized to delete this poll." });
    }

    await prisma.poll.delete({ where: { id } });
    return res.json({ message: "Poll deleted successfully." });
  } catch (error) {
    console.error("DeletePoll error:", error);
    return res.status(500).json({ message: "Error deleting poll." });
  }
};

const getPlatformStats = async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalPolls = await prisma.poll.count();
    const totalVotes = await prisma.vote.count();

    const now = new Date();
    const activePolls = await prisma.poll.count({
      where: {
        isClosed: false,
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }]
      }
    });

    return res.json({
      totalUsers,
      totalPolls,
      totalVotes,
      activePolls
    });
  } catch (error) {
    console.error("Stats error:", error);
    return res.status(500).json({ message: "Error fetching platform statistics." });
  }
};

module.exports = {
  createPoll,
  getAllPolls,
  getPollById,
  getUserPolls,
  getUserVotedPolls,
  toggleClosePoll,
  deletePoll,
  getPlatformStats,
  formatPollData
};
