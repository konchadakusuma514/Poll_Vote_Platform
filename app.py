import os
import sys

# Configure UTF-8 output on Windows terminal
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

import json
import sqlite3
import hashlib
import uuid
import datetime
import webbrowser
import threading
import time
from functools import wraps
from flask import Flask, request, jsonify, send_from_directory, send_file

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "pollpulse.db")
FRONTEND_DIST = os.path.join(os.path.dirname(os.path.abspath(__file__)), "frontend", "dist")

app = Flask(__name__, static_folder=FRONTEND_DIST, static_url_path="")

# ==================== DATABASE INITIALIZATION ====================

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def hash_password(password):
    return hashlib.sha256(password.encode("utf-8")).hexdigest()

def init_db():
    conn = get_db()
    c = conn.cursor()

    c.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'USER',
        avatar TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    c.execute("""
    CREATE TABLE IF NOT EXISTS polls (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT DEFAULT 'General',
        is_private INTEGER DEFAULT 0,
        is_multiple INTEGER DEFAULT 0,
        access_code TEXT,
        expires_at TEXT,
        is_closed INTEGER DEFAULT 0,
        creator_id TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
    );
    """)

    c.execute("""
    CREATE TABLE IF NOT EXISTS poll_options (
        id TEXT PRIMARY KEY,
        poll_id TEXT NOT NULL,
        text TEXT NOT NULL,
        FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE
    );
    """)

    c.execute("""
    CREATE TABLE IF NOT EXISTS votes (
        id TEXT PRIMARY KEY,
        poll_id TEXT NOT NULL,
        option_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(poll_id, user_id, option_id),
        FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE,
        FOREIGN KEY (option_id) REFERENCES poll_options(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    """)

    c.execute("""
    CREATE TABLE IF NOT EXISTS comments (
        id TEXT PRIMARY KEY,
        poll_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        text TEXT NOT NULL,
        likes INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    """)

    c.execute("""
    CREATE TABLE IF NOT EXISTS reactions (
        id TEXT PRIMARY KEY,
        poll_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        emoji TEXT NOT NULL,
        UNIQUE(poll_id, user_id),
        FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    """)

    c.execute("""
    CREATE TABLE IF NOT EXISTS bookmarks (
        id TEXT PRIMARY KEY,
        poll_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(poll_id, user_id),
        FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    """)

    # Check if demo data exists, if not seed it!
    c.execute("SELECT COUNT(*) FROM users")
    if c.fetchone()[0] == 0:
        print("🌱 Pre-seeding database with demo users and polls...")
        pwd_hash = hash_password("password123")

        u1 = str(uuid.uuid4())
        u2 = str(uuid.uuid4())
        u3 = str(uuid.uuid4())
        u4 = str(uuid.uuid4())

        c.execute("INSERT INTO users (id, name, email, password, role, avatar) VALUES (?, ?, ?, ?, ?, ?)",
                  (u1, "Alex Morgan", "alex@example.com", pwd_hash, "ADMIN", "https://api.dicebear.com/7.x/bottts/svg?seed=Alex"))
        c.execute("INSERT INTO users (id, name, email, password, role, avatar) VALUES (?, ?, ?, ?, ?, ?)",
                  (u2, "Sophia Chen", "sophia@example.com", pwd_hash, "USER", "https://api.dicebear.com/7.x/bottts/svg?seed=Sophia"))
        c.execute("INSERT INTO users (id, name, email, password, role, avatar) VALUES (?, ?, ?, ?, ?, ?)",
                  (u3, "Rahul Sharma", "rahul@example.com", pwd_hash, "USER", "https://api.dicebear.com/7.x/bottts/svg?seed=Rahul"))
        c.execute("INSERT INTO users (id, name, email, password, role, avatar) VALUES (?, ?, ?, ?, ?, ?)",
                  (u4, "Emma Watson", "emma@example.com", pwd_hash, "USER", "https://api.dicebear.com/7.x/bottts/svg?seed=Emma"))

        # Poll 1
        p1 = str(uuid.uuid4())
        c.execute("INSERT INTO polls (id, title, description, category, creator_id, expires_at) VALUES (?, ?, ?, ?, ?, ?)",
                  (p1, "What is your primary Frontend Framework for 2026?", "Which tool allows your team to deliver high performance apps?", "Technology", u1, (datetime.datetime.utcnow() + datetime.timedelta(days=7)).isoformat()))
        opt1, opt2, opt3, opt4 = str(uuid.uuid4()), str(uuid.uuid4()), str(uuid.uuid4()), str(uuid.uuid4())
        c.execute("INSERT INTO poll_options (id, poll_id, text) VALUES (?, ?, ?)", (opt1, p1, "React / Next.js"))
        c.execute("INSERT INTO poll_options (id, poll_id, text) VALUES (?, ?, ?)", (opt2, p1, "Vue.js / Nuxt"))
        c.execute("INSERT INTO poll_options (id, poll_id, text) VALUES (?, ?, ?)", (opt3, p1, "Svelte / SvelteKit"))
        c.execute("INSERT INTO poll_options (id, poll_id, text) VALUES (?, ?, ?)", (opt4, p1, "Angular"))

        c.execute("INSERT INTO votes (id, poll_id, option_id, user_id) VALUES (?, ?, ?, ?)", (str(uuid.uuid4()), p1, opt1, u2))
        c.execute("INSERT INTO votes (id, poll_id, option_id, user_id) VALUES (?, ?, ?, ?)", (str(uuid.uuid4()), p1, opt1, u3))
        c.execute("INSERT INTO votes (id, poll_id, option_id, user_id) VALUES (?, ?, ?, ?)", (str(uuid.uuid4()), p1, opt3, u4))

        c.execute("INSERT INTO comments (id, poll_id, user_id, text, likes) VALUES (?, ?, ?, ?, ?)",
                  (str(uuid.uuid4()), p1, u2, "React ecosystem is unbeatable with Server Components and huge community!", 5))
        c.execute("INSERT INTO comments (id, poll_id, user_id, text, likes) VALUES (?, ?, ?, ?, ?)",
                  (str(uuid.uuid4()), p1, u4, "Svelte 5 runes make state management so clean and lightweight.", 3))

        # Poll 2: AI Tools (Multiple Choice)
        p2 = str(uuid.uuid4())
        c.execute("INSERT INTO polls (id, title, description, category, creator_id, is_multiple, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
                  (p2, "Which AI capabilities do you utilize most frequently?", "Select all developer tools you rely on.", "Artificial Intelligence", u2, 1, (datetime.datetime.utcnow() + datetime.timedelta(days=14)).isoformat()))
        p2_o1, p2_o2, p2_o3, p2_o4 = str(uuid.uuid4()), str(uuid.uuid4()), str(uuid.uuid4()), str(uuid.uuid4())
        c.execute("INSERT INTO poll_options (id, poll_id, text) VALUES (?, ?, ?)", (p2_o1, p2, "Code Generation & Refactoring"))
        c.execute("INSERT INTO poll_options (id, poll_id, text) VALUES (?, ?, ?)", (p2_o2, p2, "Documentation & Writing"))
        c.execute("INSERT INTO poll_options (id, poll_id, text) VALUES (?, ?, ?)", (p2_o3, p2, "Automated Testing"))
        c.execute("INSERT INTO poll_options (id, poll_id, text) VALUES (?, ?, ?)", (p2_o4, p2, "System Architecture"))

        c.execute("INSERT INTO votes (id, poll_id, option_id, user_id) VALUES (?, ?, ?, ?)", (str(uuid.uuid4()), p2, p2_o1, u1))
        c.execute("INSERT INTO votes (id, poll_id, option_id, user_id) VALUES (?, ?, ?, ?)", (str(uuid.uuid4()), p2, p2_o2, u1))
        c.execute("INSERT INTO votes (id, poll_id, option_id, user_id) VALUES (?, ?, ?, ?)", (str(uuid.uuid4()), p2, p2_o1, u3))

        # Poll 3: Work Setup
        p3 = str(uuid.uuid4())
        c.execute("INSERT INTO polls (id, title, description, category, creator_id, expires_at) VALUES (?, ?, ?, ?, ?, ?)",
                  (p3, "What is your ideal work environment setup?", "Balancing productivity and work-life balance.", "Career & Work", u3, (datetime.datetime.utcnow() + datetime.timedelta(days=3)).isoformat()))
        p3_o1, p3_o2, p3_o3 = str(uuid.uuid4()), str(uuid.uuid4()), str(uuid.uuid4())
        c.execute("INSERT INTO poll_options (id, poll_id, text) VALUES (?, ?, ?)", (p3_o1, p3, "100% Fully Remote"))
        c.execute("INSERT INTO poll_options (id, poll_id, text) VALUES (?, ?, ?)", (p3_o2, p3, "Hybrid (2-3 Days Office)"))
        c.execute("INSERT INTO poll_options (id, poll_id, text) VALUES (?, ?, ?)", (p3_o3, p3, "On-Site Office"))

        c.execute("INSERT INTO votes (id, poll_id, option_id, user_id) VALUES (?, ?, ?, ?)", (str(uuid.uuid4()), p3, p3_o1, u1))
        c.execute("INSERT INTO votes (id, poll_id, option_id, user_id) VALUES (?, ?, ?, ?)", (str(uuid.uuid4()), p3, p3_o2, u2))
        c.execute("INSERT INTO votes (id, poll_id, option_id, user_id) VALUES (?, ?, ?, ?)", (str(uuid.uuid4()), p3, p3_o1, u4))

        # Reactions
        c.execute("INSERT INTO reactions (id, poll_id, user_id, emoji) VALUES (?, ?, ?, ?)", (str(uuid.uuid4()), p1, u1, "🔥"))
        c.execute("INSERT INTO reactions (id, poll_id, user_id, emoji) VALUES (?, ?, ?, ?)", (str(uuid.uuid4()), p1, u2, "💡"))

    conn.commit()
    conn.close()

# ==================== AUTH HELPERS ====================

def get_current_user():
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None
    token = auth_header.split(" ")[1]
    # Simple token scheme: userId
    conn = get_db()
    user = conn.execute("SELECT id, name, email, role, avatar, created_at FROM users WHERE id = ?", (token,)).fetchone()
    conn.close()
    if user:
        return dict(user)
    return None

def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        user = get_current_user()
        if not user:
            return jsonify({"message": "Authentication required. Please log in."}), 401
        request.user = user
        return f(*args, **kwargs)
    return decorated

# ==================== API ROUTES ====================

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "message": "PollPulse Python Server is active!", "time": datetime.datetime.utcnow().isoformat()})

@app.route("/api/auth/register", methods=["POST"])
def register():
    data = request.json or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not name or not email or not password:
        return jsonify({"message": "Please provide name, email, and password."}), 400
    if len(password) < 6:
        return jsonify({"message": "Password must be at least 6 characters."}), 400

    conn = get_db()
    existing = conn.execute("SELECT id FROM users WHERE email = ?", (email,)).fetchone()
    if existing:
        conn.close()
        return jsonify({"message": "An account with this email already exists."}), 400

    user_id = str(uuid.uuid4())
    avatar = f"https://api.dicebear.com/7.x/bottts/svg?seed={name}"
    conn.execute("INSERT INTO users (id, name, email, password, role, avatar) VALUES (?, ?, ?, ?, 'USER', ?)",
                 (user_id, name, email, hash_password(password), avatar))
    conn.commit()
    conn.close()

    user = {"id": user_id, "name": name, "email": email, "role": "USER", "avatar": avatar}
    return jsonify({"message": "Registered successfully!", "user": user, "token": user_id}), 201

@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.json or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    conn = get_db()
    user = conn.execute("SELECT id, name, email, password, role, avatar, created_at FROM users WHERE email = ?", (email,)).fetchone()
    conn.close()

    if not user or user["password"] != hash_password(password):
        return jsonify({"message": "Invalid email or password."}), 401

    user_data = {"id": user["id"], "name": user["name"], "email": user["email"], "role": user["role"], "avatar": user["avatar"], "createdAt": user["created_at"]}
    return jsonify({"message": "Logged in successfully!", "user": user_data, "token": user["id"]})

@app.route("/api/auth/me", methods=["GET"])
def get_me():
    user = get_current_user()
    if not user:
        return jsonify({"message": "Unauthorized"}), 401
    return jsonify({"user": user})

@app.route("/api/polls/stats", methods=["GET"])
def get_stats():
    conn = get_db()
    total_users = conn.execute("SELECT COUNT(*) FROM users").fetchone()[0]
    total_polls = conn.execute("SELECT COUNT(*) FROM polls").fetchone()[0]
    total_votes = conn.execute("SELECT COUNT(*) FROM votes").fetchone()[0]
    now_iso = datetime.datetime.utcnow().isoformat()
    active_polls = conn.execute("SELECT COUNT(*) FROM polls WHERE is_closed = 0 AND (expires_at IS NULL OR expires_at > ?)", (now_iso,)).fetchone()[0]
    conn.close()
    return jsonify({
        "totalUsers": total_users,
        "totalPolls": total_polls,
        "totalVotes": total_votes,
        "activePolls": active_polls
    })

def format_poll_row(conn, poll_row, current_user_id=None):
    poll_id = poll_row["id"]
    creator = conn.execute("SELECT id, name, avatar FROM users WHERE id = ?", (poll_row["creator_id"],)).fetchone()
    options_rows = conn.execute("SELECT id, text FROM poll_options WHERE poll_id = ?", (poll_id,)).fetchall()

    # Get votes per option
    options = []
    total_votes = 0
    option_vote_counts = {}
    for opt in options_rows:
        cnt = conn.execute("SELECT COUNT(*) FROM votes WHERE option_id = ?", (opt["id"],)).fetchone()[0]
        option_vote_counts[opt["id"]] = cnt
        total_votes += cnt

    for opt in options_rows:
        cnt = option_vote_counts[opt["id"]]
        pct = round((cnt / total_votes * 100), 1) if total_votes > 0 else 0
        options.append({"id": opt["id"], "text": opt["text"], "voteCount": cnt, "percentage": pct})

    # Check current user votes
    has_voted = False
    user_voted_options = []
    if current_user_id:
        uv = conn.execute("SELECT option_id FROM votes WHERE poll_id = ? AND user_id = ?", (poll_id, current_user_id)).fetchall()
        if uv:
            has_voted = True
            user_voted_options = [r["option_id"] for r in uv]

    # Expiry
    now = datetime.datetime.utcnow()
    is_expired = False
    if poll_row["expires_at"]:
        try:
            exp_date = datetime.datetime.fromisoformat(poll_row["expires_at"].replace("Z", "+00:00")).replace(tzinfo=None)
            is_expired = exp_date < now
        except Exception:
            pass

    is_closed = bool(poll_row["is_closed"]) or is_expired

    return {
        "id": poll_row["id"],
        "title": poll_row["title"],
        "description": poll_row["description"],
        "category": poll_row["category"],
        "isPrivate": bool(poll_row["is_private"]),
        "isMultiple": bool(poll_row["is_multiple"]),
        "hasAccessCode": bool(poll_row["access_code"]),
        "expiresAt": poll_row["expires_at"],
        "isClosed": is_closed,
        "isExpired": is_expired,
        "createdAt": poll_row["created_at"],
        "creator": dict(creator) if creator else None,
        "totalVotes": total_votes,
        "options": options,
        "hasVoted": has_voted,
        "userVotedOptionIds": user_voted_options
    }

@app.route("/api/polls", methods=["GET"])
def get_all_polls():
    category = request.args.get("category")
    status = request.args.get("status", "all")
    sort = request.args.get("sort", "newest")
    search = request.args.get("search", "").strip().lower()

    current_user = get_current_user()
    current_user_id = current_user["id"] if current_user else None

    query = "SELECT * FROM polls WHERE is_private = 0"
    params = []

    if category and category != "All":
        query += " AND category = ?"
        params.append(category)

    if search:
        query += " AND (LOWER(title) LIKE ? OR LOWER(description) LIKE ?)"
        params.extend([f"%{search}%", f"%{search}%"])

    query += " ORDER BY created_at DESC"

    conn = get_db()
    rows = conn.execute(query, params).fetchall()
    polls = [format_poll_row(conn, r, current_user_id) for r in rows]
    conn.close()

    # Filter status
    if status == "active":
        polls = [p for p in polls if not p["isClosed"]]
    elif status in ("closed", "expired"):
        polls = [p for p in polls if p["isClosed"]]

    # Sort
    if sort == "votes":
        polls.sort(key=lambda x: x["totalVotes"], reverse=True)
    elif sort == "expiring":
        polls = [p for p in polls if p["expiresAt"] and not p["isClosed"]]
        polls.sort(key=lambda x: x["expiresAt"])

    return jsonify({"polls": polls})

@app.route("/api/polls/<poll_id>", methods=["GET"])
def get_poll(poll_id):
    code = request.args.get("code", "").strip()
    current_user = get_current_user()
    current_user_id = current_user["id"] if current_user else None

    conn = get_db()
    row = conn.execute("SELECT * FROM polls WHERE id = ?", (poll_id,)).fetchone()
    if not row:
        conn.close()
        return jsonify({"message": "Poll not found"}), 404

    # Check access code if private
    if row["is_private"] and row["access_code"]:
        is_creator = current_user_id and current_user_id == row["creator_id"]
        is_admin = current_user and current_user.get("role") == "ADMIN"
        if not is_creator and not is_admin and code != row["access_code"]:
            conn.close()
            return jsonify({"message": "Access code required to view this private poll.", "isPrivate": True, "requireCode": True}), 403

    formatted = format_poll_row(conn, row, current_user_id)

    # Get comments
    comments_rows = conn.execute("""
        SELECT c.id, c.text, c.likes, c.created_at, u.id as user_id, u.name as user_name, u.avatar as user_avatar
        FROM comments c JOIN users u ON c.user_id = u.id
        WHERE c.poll_id = ? ORDER BY c.created_at DESC
    """, (poll_id,)).fetchall()

    comments = [{
        "id": c["id"],
        "text": c["text"],
        "likes": c["likes"],
        "createdAt": c["created_at"],
        "user": {"id": c["user_id"], "name": c["user_name"], "avatar": c["user_avatar"]}
    } for c in comments_rows]

    # Get reactions breakdown
    reactions_rows = conn.execute("SELECT emoji, COUNT(*) as count FROM reactions WHERE poll_id = ? GROUP BY emoji", (poll_id,)).fetchall()
    reactions = {r["emoji"]: r["count"] for r in reactions_rows}

    # User reaction
    user_reaction = None
    if current_user_id:
        ur = conn.execute("SELECT emoji FROM reactions WHERE poll_id = ? AND user_id = ?", (poll_id, current_user_id)).fetchone()
        if ur: user_reaction = ur["emoji"]

    conn.close()

    formatted["comments"] = comments
    formatted["reactions"] = reactions
    formatted["userReaction"] = user_reaction
    return jsonify({"poll": formatted})

@app.route("/api/polls", methods=["POST"])
def create_poll():
    current_user = get_current_user()
    if not current_user:
        return jsonify({"message": "Please log in to create a poll."}), 401

    data = request.json or {}
    title = (data.get("title") or "").strip()
    description = (data.get("description") or "").strip()
    category = data.get("category") or "General"
    options = data.get("options") or []
    is_private = 1 if data.get("isPrivate") else 0
    is_multiple = 1 if data.get("isMultiple") else 0
    access_code = data.get("accessCode") if is_private else None
    expires_at = data.get("expiresAt")

    if not title:
        return jsonify({"message": "Poll title is required."}), 400

    clean_options = [opt.strip() for opt in options if opt and opt.strip()]
    if len(clean_options) < 2:
        return jsonify({"message": "At least 2 non-empty options are required."}), 400

    poll_id = str(uuid.uuid4())
    conn = get_db()
    conn.execute("""
        INSERT INTO polls (id, title, description, category, is_private, is_multiple, access_code, expires_at, creator_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (poll_id, title, description, category, is_private, is_multiple, access_code, expires_at, current_user["id"]))

    for opt_text in clean_options:
        conn.execute("INSERT INTO poll_options (id, poll_id, text) VALUES (?, ?, ?)", (str(uuid.uuid4()), poll_id, opt_text))

    conn.commit()
    row = conn.execute("SELECT * FROM polls WHERE id = ?", (poll_id,)).fetchone()
    formatted = format_poll_row(conn, row, current_user["id"])
    conn.close()

    return jsonify({"message": "Poll created successfully!", "poll": formatted}), 201

@app.route("/api/votes/<poll_id>", methods=["POST"])
def cast_vote(poll_id):
    current_user = get_current_user()
    if not current_user:
        return jsonify({"message": "Please log in to vote."}), 401

    user_id = current_user["id"]
    data = request.json or {}
    option_ids = data.get("optionIds") or []
    if isinstance(option_ids, str):
        option_ids = [option_ids]

    if not option_ids:
        return jsonify({"message": "Please select an option to vote."}), 400

    conn = get_db()
    poll = conn.execute("SELECT * FROM polls WHERE id = ?", (poll_id,)).fetchone()
    if not poll:
        conn.close()
        return jsonify({"message": "Poll not found"}), 404

    # Check if closed
    now = datetime.datetime.utcnow()
    is_expired = False
    if poll["expires_at"]:
        try:
            exp_date = datetime.datetime.fromisoformat(poll["expires_at"].replace("Z", "+00:00")).replace(tzinfo=None)
            is_expired = exp_date < now
        except Exception: pass

    if poll["is_closed"] or is_expired:
        conn.close()
        return jsonify({"message": "This poll is closed or expired. Voting is disabled."}), 400

    # Strict Duplicate Vote Check!
    existing = conn.execute("SELECT COUNT(*) FROM votes WHERE poll_id = ? AND user_id = ?", (poll_id, user_id)).fetchone()[0]
    if existing > 0:
        conn.close()
        return jsonify({"message": "You have already voted on this poll! Duplicate voting is prevented."}), 400

    # Insert votes atomically
    for opt_id in option_ids:
        conn.execute("INSERT INTO votes (id, poll_id, option_id, user_id) VALUES (?, ?, ?, ?)",
                     (str(uuid.uuid4()), poll_id, opt_id, user_id))

    conn.commit()
    updated_poll = conn.execute("SELECT * FROM polls WHERE id = ?", (poll_id,)).fetchone()
    formatted = format_poll_row(conn, updated_poll, user_id)
    conn.close()

    return jsonify({"message": "Vote cast successfully!", "poll": formatted})

# Comments & Discussions
@app.route("/api/comments/<poll_id>", methods=["POST"])
def post_comment(poll_id):
    current_user = get_current_user()
    if not current_user:
        return jsonify({"message": "Please log in to comment."}), 401

    text = (request.json.get("text") or "").strip()
    if not text:
        return jsonify({"message": "Comment cannot be empty."}), 400

    comment_id = str(uuid.uuid4())
    conn = get_db()
    conn.execute("INSERT INTO comments (id, poll_id, user_id, text) VALUES (?, ?, ?, ?)",
                 (comment_id, poll_id, current_user["id"], text))
    conn.commit()
    conn.close()
    return jsonify({"message": "Comment posted successfully!"})

@app.route("/api/comments/<comment_id>/like", methods=["POST"])
def like_comment(comment_id):
    conn = get_db()
    conn.execute("UPDATE comments SET likes = likes + 1 WHERE id = ?", (comment_id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Comment liked!"})

# Reactions (Emoji Reactions: 🔥, 💡, 🚀, 👏, 🤔)
@app.route("/api/reactions/<poll_id>", methods=["POST"])
def react_poll(poll_id):
    current_user = get_current_user()
    if not current_user:
        return jsonify({"message": "Please log in to react."}), 401

    emoji = request.json.get("emoji") or "🔥"
    conn = get_db()
    conn.execute("INSERT OR REPLACE INTO reactions (id, poll_id, user_id, emoji) VALUES (?, ?, ?, ?)",
                 (str(uuid.uuid4()), poll_id, current_user["id"], emoji))
    conn.commit()
    conn.close()
    return jsonify({"message": "Reaction recorded!"})

# Bookmarks Toggle & Retrieval
@app.route("/api/bookmarks/<poll_id>", methods=["POST"])
def toggle_bookmark(poll_id):
    current_user = get_current_user()
    if not current_user:
        return jsonify({"message": "Please log in to save bookmarks."}), 401

    conn = get_db()
    exists = conn.execute("SELECT id FROM bookmarks WHERE poll_id = ? AND user_id = ?", (poll_id, current_user["id"])).fetchone()
    if exists:
        conn.execute("DELETE FROM bookmarks WHERE id = ?", (exists["id"],))
        conn.commit()
        conn.close()
        return jsonify({"message": "Bookmark removed.", "isBookmarked": False})
    else:
        conn.execute("INSERT INTO bookmarks (id, poll_id, user_id) VALUES (?, ?, ?)", (str(uuid.uuid4()), poll_id, current_user["id"]))
        conn.commit()
        conn.close()
        return jsonify({"message": "Poll bookmarked!", "isBookmarked": True})

@app.route("/api/bookmarks/user", methods=["GET"])
def get_user_bookmarks():
    current_user = get_current_user()
    if not current_user: return jsonify({"message": "Unauthorized"}), 401

    conn = get_db()
    rows = conn.execute("""
        SELECT p.* FROM polls p JOIN bookmarks b ON p.id = b.poll_id
        WHERE b.user_id = ? ORDER BY b.created_at DESC
    """, (current_user["id"],)).fetchall()
    polls = [format_poll_row(conn, r, current_user["id"]) for r in rows]
    conn.close()
    return jsonify({"polls": polls})

# Profile Edit
@app.route("/api/auth/profile", methods=["PUT"])
def update_profile():
    current_user = get_current_user()
    if not current_user: return jsonify({"message": "Unauthorized"}), 401

    data = request.json or {}
    name = (data.get("name") or "").strip()
    avatar = data.get("avatar") or current_user["avatar"]

    if not name:
        return jsonify({"message": "Name cannot be empty."}), 400

    conn = get_db()
    conn.execute("UPDATE users SET name = ?, avatar = ? WHERE id = ?", (name, avatar, current_user["id"]))
    conn.commit()
    user = conn.execute("SELECT id, name, email, role, avatar, created_at FROM users WHERE id = ?", (current_user["id"],)).fetchone()
    conn.close()
    return jsonify({"message": "Profile updated!", "user": dict(user)})

# User created & voted polls
@app.route("/api/polls/user/created", methods=["GET"])
def get_user_created_polls():
    current_user = get_current_user()
    if not current_user: return jsonify({"message": "Unauthorized"}), 401

    conn = get_db()
    rows = conn.execute("SELECT * FROM polls WHERE creator_id = ? ORDER BY created_at DESC", (current_user["id"],)).fetchall()
    polls = [format_poll_row(conn, r, current_user["id"]) for r in rows]
    conn.close()
    return jsonify({"polls": polls})


@app.route("/api/polls/user/voted", methods=["GET"])
def get_user_voted_polls():
    current_user = get_current_user()
    if not current_user: return jsonify({"message": "Unauthorized"}), 401

    conn = get_db()
    rows = conn.execute("""
        SELECT DISTINCT p.* FROM polls p JOIN votes v ON p.id = v.poll_id
        WHERE v.user_id = ? ORDER BY p.created_at DESC
    """, (current_user["id"],)).fetchall()
    polls = [format_poll_row(conn, r, current_user["id"]) for r in rows]
    conn.close()
    return jsonify({"polls": polls})

@app.route("/api/polls/<poll_id>/toggle-close", methods=["PATCH"])
def toggle_close(poll_id):
    current_user = get_current_user()
    if not current_user: return jsonify({"message": "Unauthorized"}), 401

    conn = get_db()
    poll = conn.execute("SELECT * FROM polls WHERE id = ?", (poll_id,)).fetchone()
    if not poll:
        conn.close()
        return jsonify({"message": "Poll not found"}), 404

    if poll["creator_id"] != current_user["id"] and current_user.get("role") != "ADMIN":
        conn.close()
        return jsonify({"message": "Unauthorized"}), 403

    new_status = 0 if poll["is_closed"] else 1
    conn.execute("UPDATE polls SET is_closed = ? WHERE id = ?", (new_status, poll_id))
    conn.commit()
    updated = conn.execute("SELECT * FROM polls WHERE id = ?", (poll_id,)).fetchone()
    formatted = format_poll_row(conn, updated, current_user["id"])
    conn.close()
    return jsonify({"message": "Poll status updated.", "poll": formatted})

@app.route("/api/polls/<poll_id>", methods=["DELETE"])
def delete_poll(poll_id):
    current_user = get_current_user()
    if not current_user: return jsonify({"message": "Unauthorized"}), 401

    conn = get_db()
    poll = conn.execute("SELECT * FROM polls WHERE id = ?", (poll_id,)).fetchone()
    if not poll:
        conn.close()
        return jsonify({"message": "Poll not found"}), 404

    if poll["creator_id"] != current_user["id"] and current_user.get("role") != "ADMIN":
        conn.close()
        return jsonify({"message": "Unauthorized"}), 403

    conn.execute("DELETE FROM polls WHERE id = ?", (poll_id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Poll deleted successfully."})

# ==================== STATIC FRONTEND SERVING ====================

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    if path != "" and os.path.exists(os.path.join(FRONTEND_DIST, path)):
        return send_from_directory(FRONTEND_DIST, path)
    index_file = os.path.join(FRONTEND_DIST, "index.html")
    if os.path.exists(index_file):
        return send_file(index_file)
    return "<h1>PollPulse API is active! (Frontend build not found. Please run 'npm run build' inside frontend)</h1>", 200

# ==================== MAIN SERVER ENTRYPOINT ====================

if __name__ == "__main__":
    init_db()
    port = int(os.environ.get("PORT", 5000))
    print("=" * 68)
    print("  🗳️  POLLPULSE — REAL-TIME POLLING & VOTING PLATFORM")
    print("  ✨  Status: Server is ACTIVE & Ready!")
    print("  🌐  Multi-Language: English | Hindi | Telugu | Tamil | Spanish")
    print("  🌗  Theme: Light Mode (Default) & Dark Mode")
    print("  🛡️  Zero Duplicate Voting Guarantee")
    print("=" * 68)
    print("  👉  COPY & PASTE THIS URL INTO YOUR CHROME / BROWSER:")
    print(f"      http://127.0.0.1:{port}")
    print("=" * 68)

    app.run(host="0.0.0.0", port=port, debug=False)

