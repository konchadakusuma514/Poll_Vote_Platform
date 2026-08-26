const API_URL = "/api";

const INITIAL_USERS = [
  { id: "u-alex", name: "Alex Morgan", email: "alex@example.com", password: "password123", role: "ADMIN", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Alex", createdAt: new Date().toISOString() },
  { id: "u-sophia", name: "Sophia Chen", email: "sophia@example.com", password: "password123", role: "USER", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Sophia", createdAt: new Date().toISOString() },
  { id: "u-rahul", name: "Rahul Sharma", email: "rahul@example.com", password: "password123", role: "USER", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Rahul", createdAt: new Date().toISOString() }
];

const INITIAL_POLLS = [
  {
    id: "p-frameworks",
    title: "What is your primary Frontend Framework for 2026?",
    description: "Which technology stack delivers the fastest developer velocity, server components, and performance for your team?",
    category: "Technology",
    isPrivate: false,
    isMultiple: false,
    accessCode: null,
    expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
    isClosed: false,
    creator: { id: "u-alex", name: "Alex Morgan", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Alex" },
    totalVotes: 3,
    options: [
      { id: "opt-1", text: "React / Next.js", voteCount: 2, percentage: 66.7 },
      { id: "opt-2", text: "Vue.js / Nuxt", voteCount: 0, percentage: 0 },
      { id: "opt-3", text: "Svelte 5 / SvelteKit", voteCount: 1, percentage: 33.3 },
      { id: "opt-4", text: "Angular", voteCount: 0, percentage: 0 }
    ],
    comments: [
      { id: "c-1", user: { id: "u-sophia", name: "Sophia Chen", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Sophia" }, text: "React ecosystem with Next.js App Router and Server Actions is unbeatable!", likes: 6, createdAt: new Date().toISOString() },
      { id: "c-2", user: { id: "u-rahul", name: "Rahul Sharma", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Rahul" }, text: "Svelte 5 runes have simplified reactivity so much. Highly recommended.", likes: 4, createdAt: new Date().toISOString() }
    ],
    reactions: { "🔥": 4, "💡": 2, "🚀": 5, "👏": 3, "🤔": 1 },
    userVotedOptionIds: [],
    createdAt: new Date().toISOString()
  },
  {
    id: "p-ai-tools",
    title: "Which AI capabilities do you utilize most frequently?",
    description: "Select all AI capabilities you rely on for engineering and workflow automation weekly.",
    category: "Artificial Intelligence",
    isPrivate: false,
    isMultiple: true,
    accessCode: null,
    expiresAt: new Date(Date.now() + 14 * 86400000).toISOString(),
    isClosed: false,
    creator: { id: "u-sophia", name: "Sophia Chen", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Sophia" },
    totalVotes: 3,
    options: [
      { id: "p2-opt-1", text: "Code Generation & Refactoring", voteCount: 2, percentage: 66.7 },
      { id: "p2-opt-2", text: "Automated Testing & Bug Hunting", voteCount: 1, percentage: 33.3 },
      { id: "p2-opt-3", text: "System Architecture Design", voteCount: 0, percentage: 0 },
      { id: "p2-opt-4", text: "Documentation & Writing", voteCount: 0, percentage: 0 }
    ],
    comments: [],
    reactions: { "🚀": 8, "💡": 5 },
    userVotedOptionIds: [],
    createdAt: new Date().toISOString()
  },
  {
    id: "p-work-setup",
    title: "What is your ideal work environment setup?",
    description: "Balancing collaboration, focus time, and work-life balance.",
    category: "Career & Work",
    isPrivate: false,
    isMultiple: false,
    accessCode: null,
    expiresAt: new Date(Date.now() + 3 * 86400000).toISOString(),
    isClosed: false,
    creator: { id: "u-rahul", name: "Rahul Sharma", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Rahul" },
    totalVotes: 3,
    options: [
      { id: "p3-opt-1", text: "100% Fully Remote", voteCount: 2, percentage: 66.7 },
      { id: "p3-opt-2", text: "Hybrid (2-3 Days Office)", voteCount: 1, percentage: 33.3 },
      { id: "p3-opt-3", text: "On-Site Office", voteCount: 0, percentage: 0 }
    ],
    comments: [],
    reactions: { "👏": 6, "🔥": 3 },
    userVotedOptionIds: [],
    createdAt: new Date().toISOString()
  }
];

const getStored = (key, fallback) => {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch (e) {
    return fallback;
  }
};

const setStored = (key, val) => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {}
};

if (!localStorage.getItem("pp_polls")) {
  setStored("pp_polls", INITIAL_POLLS);
}
if (!localStorage.getItem("pp_users")) {
  setStored("pp_users", INITIAL_USERS);
}
if (!localStorage.getItem("pp_votes")) {
  setStored("pp_votes", []);
}
if (!localStorage.getItem("pp_bookmarks")) {
  setStored("pp_bookmarks", []);
}

const getHeaders = (includeAuth = true) => {
  const headers = { "Content-Type": "application/json" };
  if (includeAuth) {
    const token = localStorage.getItem("token");
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

const getCurrentMockUser = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  const users = getStored("pp_users", INITIAL_USERS);
  return users.find((u) => u.id === token) || null;
};

export const api = {
  // Auth
  async register(data) {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: getHeaders(false),
        body: JSON.stringify(data)
      });
      if (res.ok) return await res.json();
    } catch (e) {}

    const users = getStored("pp_users", INITIAL_USERS);
    const existing = users.find((u) => u.email.toLowerCase() === data.email.toLowerCase());
    if (existing) throw new Error("An account with this email already exists.");

    const newUser = {
      id: "u-" + Date.now(),
      name: data.name,
      email: data.email.toLowerCase(),
      password: data.password,
      role: "USER",
      avatar: data.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(data.name)}`,
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    setStored("pp_users", users);
    localStorage.setItem("token", newUser.id);
    return { message: "Registered successfully!", user: newUser, token: newUser.id };
  },

  async login(data) {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: getHeaders(false),
        body: JSON.stringify(data)
      });
      if (res.ok) return await res.json();
    } catch (e) {}

    const users = getStored("pp_users", INITIAL_USERS);
    const user = users.find((u) => u.email.toLowerCase() === data.email.toLowerCase());
    if (!user || user.password !== data.password) {
      throw new Error("Invalid email or password.");
    }
    localStorage.setItem("token", user.id);
    return { message: "Logged in successfully!", user, token: user.id };
  },

  async getMe() {
    try {
      const res = await fetch(`${API_URL}/auth/me`, { headers: getHeaders(true) });
      if (res.ok) return await res.json();
    } catch (e) {}

    const user = getCurrentMockUser();
    if (!user) throw new Error("Unauthorized");
    return { user };
  },

  async updateProfile(name, avatar) {
    try {
      const res = await fetch(`${API_URL}/auth/profile`, {
        method: "PUT",
        headers: getHeaders(true),
        body: JSON.stringify({ name, avatar })
      });
      if (res.ok) return await res.json();
    } catch (e) {}

    const user = getCurrentMockUser();
    if (!user) throw new Error("Unauthorized");
    const users = getStored("pp_users", INITIAL_USERS);
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx !== -1) {
      users[idx].name = name;
      users[idx].avatar = avatar;
      setStored("pp_users", users);
      return { message: "Profile updated!", user: users[idx] };
    }
    throw new Error("User not found");
  },

  // Polls
  async getPolls(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_URL}/polls?${query}`, { headers: getHeaders(true) });
      if (res.ok) return await res.json();
    } catch (e) {}

    let polls = getStored("pp_polls", INITIAL_POLLS);
    const currentUser = getCurrentMockUser();
    const votes = getStored("pp_votes", []);
    const bookmarks = getStored("pp_bookmarks", []);

    polls = polls.map((p) => {
      const userVotes = currentUser ? votes.filter((v) => v.pollId === p.id && v.userId === currentUser.id) : [];
      const isBookmarked = currentUser ? bookmarks.some((b) => b.pollId === p.id && b.userId === currentUser.id) : false;
      return {
        ...p,
        hasVoted: userVotes.length > 0,
        isBookmarked,
        userVotedOptionIds: userVotes.map((v) => v.optionId)
      };
    });

    if (params.category && params.category !== "All") {
      polls = polls.filter((p) => p.category === params.category);
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      polls = polls.filter((p) => p.title.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q)));
    }
    if (params.status === "active") {
      polls = polls.filter((p) => !p.isClosed);
    } else if (params.status === "closed") {
      polls = polls.filter((p) => p.isClosed);
    }
    if (params.sort === "votes") {
      polls.sort((a, b) => b.totalVotes - a.totalVotes);
    }

    return { polls };
  },

  async getPollById(id, code = "") {
    try {
      const query = code ? `?code=${encodeURIComponent(code)}` : "";
      const res = await fetch(`${API_URL}/polls/${id}${query}`, { headers: getHeaders(true) });
      if (res.ok) return await res.json();
    } catch (e) {}

    const polls = getStored("pp_polls", INITIAL_POLLS);
    const poll = polls.find((p) => p.id === id);
    if (!poll) throw new Error("Poll not found");

    const currentUser = getCurrentMockUser();
    const votes = getStored("pp_votes", []);
    const bookmarks = getStored("pp_bookmarks", []);
    const userVotes = currentUser ? votes.filter((v) => v.pollId === poll.id && v.userId === currentUser.id) : [];
    const isBookmarked = currentUser ? bookmarks.some((b) => b.pollId === poll.id && b.userId === currentUser.id) : false;

    return {
      poll: {
        ...poll,
        hasVoted: userVotes.length > 0,
        isBookmarked,
        userVotedOptionIds: userVotes.map((v) => v.optionId)
      }
    };
  },

  async createPoll(pollData) {
    try {
      const res = await fetch(`${API_URL}/polls`, {
        method: "POST",
        headers: getHeaders(true),
        body: JSON.stringify(pollData)
      });
      if (res.ok) return await res.json();
    } catch (e) {}

    const user = getCurrentMockUser();
    if (!user) throw new Error("Please log in to create a poll.");

    const polls = getStored("pp_polls", INITIAL_POLLS);
    const pollId = "p-" + Date.now();
    const options = pollData.options.map((opt, i) => ({
      id: `opt-${pollId}-${i}`,
      text: opt,
      voteCount: 0,
      percentage: 0
    }));

    const newPoll = {
      id: pollId,
      title: pollData.title,
      description: pollData.description || "",
      category: pollData.category || "General",
      isPrivate: !!pollData.isPrivate,
      isMultiple: !!pollData.isMultiple,
      accessCode: pollData.accessCode || null,
      expiresAt: pollData.expiresAt || null,
      isClosed: false,
      creator: { id: user.id, name: user.name, avatar: user.avatar },
      totalVotes: 0,
      options,
      comments: [],
      reactions: { "🔥": 1 },
      userVotedOptionIds: [],
      createdAt: new Date().toISOString()
    };

    polls.unshift(newPoll);
    setStored("pp_polls", polls);
    return { message: "Poll created successfully!", poll: newPoll };
  },

  async castVote(pollId, optionIds) {
    try {
      const res = await fetch(`${API_URL}/votes/${pollId}`, {
        method: "POST",
        headers: getHeaders(true),
        body: JSON.stringify({ optionIds })
      });
      if (res.ok) return await res.json();
    } catch (e) {}

    const user = getCurrentMockUser();
    if (!user) throw new Error("Please log in to vote.");

    const votes = getStored("pp_votes", []);
    const alreadyVoted = votes.some((v) => v.pollId === pollId && v.userId === user.id);
    if (alreadyVoted) throw new Error("You have already voted on this poll!");

    const polls = getStored("pp_polls", INITIAL_POLLS);
    const pollIdx = polls.findIndex((p) => p.id === pollId);
    if (pollIdx === -1) throw new Error("Poll not found");

    const optArr = Array.isArray(optionIds) ? optionIds : [optionIds];
    optArr.forEach((optId) => {
      votes.push({ id: "v-" + Date.now() + Math.random(), pollId, optionId: optId, userId: user.id });
      const o = polls[pollIdx].options.find((opt) => opt.id === optId);
      if (o) o.voteCount += 1;
      polls[pollIdx].totalVotes += 1;
    });

    polls[pollIdx].options.forEach((opt) => {
      opt.percentage = polls[pollIdx].totalVotes > 0 ? Math.round((opt.voteCount / polls[pollIdx].totalVotes) * 100) : 0;
    });

    setStored("pp_votes", votes);
    setStored("pp_polls", polls);

    return {
      message: "Vote cast successfully!",
      poll: {
        ...polls[pollIdx],
        hasVoted: true,
        userVotedOptionIds: optArr
      }
    };
  },

  async postComment(pollId, text) {
    try {
      const res = await fetch(`${API_URL}/comments/${pollId}`, {
        method: "POST",
        headers: getHeaders(true),
        body: JSON.stringify({ text })
      });
      if (res.ok) return await res.json();
    } catch (e) {}

    const user = getCurrentMockUser();
    if (!user) throw new Error("Please log in to comment.");
    const polls = getStored("pp_polls", INITIAL_POLLS);
    const p = polls.find((x) => x.id === pollId);
    if (p) {
      p.comments = p.comments || [];
      p.comments.unshift({
        id: "c-" + Date.now(),
        user: { id: user.id, name: user.name, avatar: user.avatar },
        text,
        likes: 0,
        createdAt: new Date().toISOString()
      });
      setStored("pp_polls", polls);
    }
    return { message: "Comment posted!" };
  },

  async likeComment(commentId) {
    try {
      const res = await fetch(`${API_URL}/comments/${commentId}/like`, { method: "POST", headers: getHeaders(true) });
      if (res.ok) return await res.json();
    } catch (e) {}

    const polls = getStored("pp_polls", INITIAL_POLLS);
    polls.forEach((p) => {
      if (p.comments) {
        const c = p.comments.find((item) => item.id === commentId);
        if (c) c.likes += 1;
      }
    });
    setStored("pp_polls", polls);
    return { message: "Comment liked!" };
  },

  async reactPoll(pollId, emoji) {
    try {
      const res = await fetch(`${API_URL}/reactions/${pollId}`, {
        method: "POST",
        headers: getHeaders(true),
        body: JSON.stringify({ emoji })
      });
      if (res.ok) return await res.json();
    } catch (e) {}

    const polls = getStored("pp_polls", INITIAL_POLLS);
    const p = polls.find((x) => x.id === pollId);
    if (p) {
      p.reactions = p.reactions || {};
      p.reactions[emoji] = (p.reactions[emoji] || 0) + 1;
      setStored("pp_polls", polls);
    }
    return { message: "Reaction recorded!" };
  },

  async toggleBookmark(pollId) {
    try {
      const res = await fetch(`${API_URL}/bookmarks/${pollId}`, { method: "POST", headers: getHeaders(true) });
      if (res.ok) return await res.json();
    } catch (e) {}

    const user = getCurrentMockUser();
    if (!user) throw new Error("Please log in to save bookmarks.");
    const bookmarks = getStored("pp_bookmarks", []);
    const idx = bookmarks.findIndex((b) => b.pollId === pollId && b.userId === user.id);
    let isBookmarked = false;
    if (idx !== -1) {
      bookmarks.splice(idx, 1);
      isBookmarked = false;
    } else {
      bookmarks.push({ id: "bm-" + Date.now(), pollId, userId: user.id });
      isBookmarked = true;
    }
    setStored("pp_bookmarks", bookmarks);
    return { message: isBookmarked ? "Poll bookmarked!" : "Bookmark removed.", isBookmarked };
  },

  async getUserBookmarks() {
    try {
      const res = await fetch(`${API_URL}/bookmarks/user`, { headers: getHeaders(true) });
      if (res.ok) return await res.json();
    } catch (e) {}

    const user = getCurrentMockUser();
    if (!user) return { polls: [] };
    const bookmarks = getStored("pp_bookmarks", []);
    const userBmIds = bookmarks.filter((b) => b.userId === user.id).map((b) => b.pollId);
    const polls = getStored("pp_polls", INITIAL_POLLS).filter((p) => userBmIds.includes(p.id));
    return { polls };
  },

  async getUserCreatedPolls() {
    try {
      const res = await fetch(`${API_URL}/polls/user/created`, { headers: getHeaders(true) });
      if (res.ok) return await res.json();
    } catch (e) {}

    const user = getCurrentMockUser();
    if (!user) return { polls: [] };
    const polls = getStored("pp_polls", INITIAL_POLLS).filter((p) => p.creator?.id === user.id);
    return { polls };
  },

  async getUserVotedPolls() {
    try {
      const res = await fetch(`${API_URL}/polls/user/voted`, { headers: getHeaders(true) });
      if (res.ok) return await res.json();
    } catch (e) {}

    const user = getCurrentMockUser();
    if (!user) return { polls: [] };
    const votes = getStored("pp_votes", []);
    const votedPollIds = votes.filter((v) => v.userId === user.id).map((v) => v.pollId);
    const polls = getStored("pp_polls", INITIAL_POLLS).filter((p) => votedPollIds.includes(p.id));
    return { polls };
  },

  async getPlatformStats() {
    try {
      const res = await fetch(`${API_URL}/polls/stats`);
      if (res.ok) return await res.json();
    } catch (e) {}

    const polls = getStored("pp_polls", INITIAL_POLLS);
    const users = getStored("pp_users", INITIAL_USERS);
    const totalVotes = polls.reduce((sum, p) => sum + p.totalVotes, 0);

    const leaderboard = users.map((u) => ({
      id: u.id,
      name: u.name,
      avatar: u.avatar,
      polls: polls.filter((p) => p.creator?.id === u.id).length
    })).sort((a, b) => b.polls - a.polls);

    const recentActivities = [
      { id: "act-1", userName: "Sophia Chen", userAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Sophia", pollTitle: "Frontend Frameworks 2026", pollId: "p-frameworks" },
      { id: "act-2", userName: "Rahul Sharma", userAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Rahul", pollTitle: "AI Capabilities in Dev", pollId: "p-ai-tools" },
      { id: "act-3", userName: "Alex Morgan", userAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Alex", pollTitle: "Ideal Work Setup", pollId: "p-work-setup" }
    ];

    return {
      totalUsers: users.length,
      totalPolls: polls.length,
      totalVotes: totalVotes,
      activePolls: polls.filter((p) => !p.isClosed).length,
      leaderboard,
      recentActivities
    };
  }
};
