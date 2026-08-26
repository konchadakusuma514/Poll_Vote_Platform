const API_URL = "/api";

const getHeaders = (includeAuth = true) => {
  const headers = { "Content-Type": "application/json" };
  if (includeAuth) {
    const token = localStorage.getItem("token");
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  // Auth
  async register(data) {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: getHeaders(false),
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || "Registration failed");
    return result;
  },

  async login(data) {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: getHeaders(false),
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || "Login failed");
    return result;
  },

  async getMe() {
    const res = await fetch(`${API_URL}/auth/me`, { headers: getHeaders(true) });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || "Failed to fetch user");
    return result;
  },

  // Polls
  async getPolls(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_URL}/polls?${query}`, { headers: getHeaders(true) });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || "Failed to fetch polls");
    return result;
  },

  async getPollById(id, code = "") {
    const query = code ? `?code=${encodeURIComponent(code)}` : "";
    const res = await fetch(`${API_URL}/polls/${id}${query}`, { headers: getHeaders(true) });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || "Failed to fetch poll");
    return result;
  },

  async createPoll(pollData) {
    const res = await fetch(`${API_URL}/polls`, {
      method: "POST",
      headers: getHeaders(true),
      body: JSON.stringify(pollData)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || "Failed to create poll");
    return result;
  },

  async getUserCreatedPolls() {
    const res = await fetch(`${API_URL}/polls/user/created`, { headers: getHeaders(true) });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || "Failed to fetch created polls");
    return result;
  },

  async getUserVotedPolls() {
    const res = await fetch(`${API_URL}/polls/user/voted`, { headers: getHeaders(true) });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || "Failed to fetch voted polls");
    return result;
  },

  async toggleClosePoll(id) {
    const res = await fetch(`${API_URL}/polls/${id}/toggle-close`, {
      method: "PATCH",
      headers: getHeaders(true)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || "Failed to update poll status");
    return result;
  },

  async deletePoll(id) {
    const res = await fetch(`${API_URL}/polls/${id}`, {
      method: "DELETE",
      headers: getHeaders(true)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || "Failed to delete poll");
    return result;
  },

  async getPlatformStats() {
    const res = await fetch(`${API_URL}/polls/stats`);
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || "Failed to fetch stats");
    return result;
  },

  // Votes
  async castVote(pollId, optionIds) {
    const res = await fetch(`${API_URL}/votes/${pollId}`, {
      method: "POST",
      headers: getHeaders(true),
      body: JSON.stringify({ optionIds })
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || "Failed to cast vote");
    return result;
  },

  // Comments
  async postComment(pollId, text) {
    const res = await fetch(`${API_URL}/comments/${pollId}`, {
      method: "POST",
      headers: getHeaders(true),
      body: JSON.stringify({ text })
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || "Failed to post comment");
    return result;
  },

  async likeComment(commentId) {
    const res = await fetch(`${API_URL}/comments/${commentId}/like`, {
      method: "POST",
      headers: getHeaders(true)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || "Failed to like comment");
    return result;
  },

  // Reactions
  async reactPoll(pollId, emoji) {
    const res = await fetch(`${API_URL}/reactions/${pollId}`, {
      method: "POST",
      headers: getHeaders(true),
      body: JSON.stringify({ emoji })
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || "Failed to react");
    return result;
  }
};
