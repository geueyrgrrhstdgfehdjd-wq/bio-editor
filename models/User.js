const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, '../database/bio.db');
const db = new sqlite3.Database(dbPath);

db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    display_name TEXT,
    email TEXT,
    avatar TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    key TEXT NOT NULL,
    value TEXT,
    icon TEXT,
    type TEXT DEFAULT 'text',
    display_order INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, key)
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS bio_meta (
    user_id INTEGER PRIMARY KEY,
    bio_title TEXT DEFAULT 'Bio ของฉัน',
    bio_description TEXT,
    logo_text TEXT,
    logo_emoji TEXT,
    theme_color TEXT DEFAULT '#1a1a2e',
    accent_color TEXT DEFAULT '#e94560',
    bg_style TEXT DEFAULT 'dark',
    frame_style TEXT DEFAULT 'circle',
    frame_x_offset INTEGER DEFAULT 0,
    frame_y_offset INTEGER DEFAULT 0,
    frame_scale REAL DEFAULT 1.0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )
`);

class User {
  static async create({ username, password, display_name, email }) {
    const hashed = await bcrypt.hash(password, 10);
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO users (username, password, display_name, email) VALUES (?, ?, ?, ?)`,
        [username, hashed, display_name || username, email || null],
        function(err) {
          if (err) reject(err);
          db.run(
            `INSERT INTO bio_meta (user_id, bio_title, logo_text, logo_emoji, frame_style, frame_x_offset, frame_y_offset, frame_scale)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [this.lastID, `Bio ของ ${display_name || username}`, display_name || username, '🧑', 'circle', 0, 0, 1.0]
          );
          resolve({ id: this.lastID, username, display_name, email });
        }
      );
    });
  }

  static async findByUsername(username) {
    return new Promise((resolve, reject) => {
      db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });
  }

  static async findById(id) {
    return new Promise((resolve, reject) => {
      db.get(`SELECT * FROM users WHERE id = ?`, [id], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });
  }

  static async verifyPassword(user, password) {
    return bcrypt.compare(password, user.password);
  }
}

module.exports = { db, User };
