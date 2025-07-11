// backend/server.js
//
// Simple REST API for Lumen Maze
//   POST /score   → store a score
//   GET  /top10   → return top-10 scores
//
// Run:   node server.js     (port 4000)

const express = require('express');
const cors    = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 4000;

// ──────────────────────────────────
// 1. Middleware
// ──────────────────────────────────
app.use(cors());            // allow requests from Vite dev server / deployed FE
app.use(express.json());    // parse application/json

// ──────────────────────────────────
// 2. SQLite setup
// ──────────────────────────────────
const db = new sqlite3.Database('./scores.db');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS scores (
      name  TEXT  NOT NULL,
      score INTEGER NOT NULL,
      ts    INTEGER NOT NULL
    )
  `);
});

// ──────────────────────────────────
// 3. Routes
// ──────────────────────────────────

// POST /score  { "name": "Alice", "score": 12345 }
app.post('/score', (req, res) => {
  const { name, score } = req.body;

  // basic validation / anti-cheat
  if (typeof name !== 'string' || name.length > 24) {
    return res.status(400).send('Invalid name');
  }
  if (!Number.isInteger(score) || score < 0 || score > 20000) {
    return res.status(422).send('Score out of range');
  }

  const ts = Date.now();
  db.run(
    'INSERT INTO scores (name, score, ts) VALUES (?, ?, ?)',
    [name, score, ts],
    err => {
      if (err) return res.status(500).send(err.message);
      res.sendStatus(201);  // created
    }
  );
});

// GET /top10  →  [{ name, score }]
app.get('/top10', (_, res) => {
  db.all(
    'SELECT name, score FROM scores ORDER BY score DESC, ts ASC LIMIT 10',
    (err, rows) => {
      if (err) return res.status(500).send(err.message);
      res.json(rows);
    }
  );
});

// ──────────────────────────────────
// 4. Start server
// ──────────────────────────────────
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
