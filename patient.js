const express = require('express');
const router = express.Router();
const db = require('../db');
// create patient (optional - used for testing)
router.post('/', (req, res) => {
  const { name, age, gender, email } = req.body;
  if(!name || !email) return res.status(400).json({ error: 'name and email required' });
  db.query('INSERT INTO patients (name, age, gender, email) VALUES (?, ?, ?, ?)', [name, age||null, gender||null, email], (err, result) => {
    if(err) return res.status(500).json({ error: 'DB error', details: err.message || err });
    res.json({ patient_id: result.insertId });
  });
});
module.exports = router;
