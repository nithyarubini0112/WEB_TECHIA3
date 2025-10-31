const express = require('express');
const router = express.Router();
const db = require('../db');
router.get('/', (req, res) => {
  db.query('SELECT id, name, specialization, image_url, availability FROM doctors', (err, rows) => {
    if (err) return res.status(500).json({ error: 'DB error', details: err.message || err });
    res.json(rows);
  });
});
module.exports = router;
