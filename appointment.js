const express = require('express');
const router = express.Router();
const db = require('../db');

// Book appointment: auto-create patient by email if not exists
router.post('/book', (req, res) => {
  console.log('[BOOK] payload:', req.body);
  const { name, age, gender, email, doctor_id, appointment_date, appointment_time, symptoms } = req.body;
  if (!name || !email || !doctor_id || !appointment_date || !appointment_time) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const find = 'SELECT id FROM patients WHERE email = ? LIMIT 1';
  db.query(find, [email], (err, rows) => {
    if (err) return res.status(500).json({ error: 'DB find error', details: err.message || err });
    if (rows.length > 0) {
      createAppointment(rows[0].id);
    } else {
      db.query('INSERT INTO patients (name, age, gender, email) VALUES (?, ?, ?, ?)', [name, age||null, gender||null, email], (err2, r2) => {
        if (err2) return res.status(500).json({ error: 'DB insert patient error', details: err2.message || err2 });
        createAppointment(r2.insertId);
      });
    }
  });

  function createAppointment(patient_id) {
    db.query('INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, status, symptoms) VALUES (?, ?, ?, ?, ?, ?)', [patient_id, doctor_id, appointment_date, appointment_time, 'Booked', symptoms||''], (err3, r3) => {
      if (err3) return res.status(500).json({ error: 'DB insert appointment error', details: err3.message || err3 });
      const apptId = r3.insertId;
      const q = `SELECT a.id AS appointment_id, a.appointment_date, a.appointment_time, a.status,
                       p.id AS patient_id, p.name AS patient_name, p.email,
                       d.id AS doctor_id, d.name AS doctor_name, d.specialization, d.image_url
                 FROM appointments a
                 JOIN patients p ON a.patient_id = p.id
                 JOIN doctors d ON a.doctor_id = d.id
                 WHERE a.id = ? LIMIT 1`;
      db.query(q, [apptId], (err4, details) => {
        if (err4) return res.status(500).json({ error: 'DB fetch details error', details: err4.message || err4 });
        res.json({ message: 'Appointment booked successfully', appointment: details[0] });
      });
    });
  }
});

// History by patient id
router.get('/history/:patient_id', (req, res) => {
  const pid = req.params.patient_id;
  const sql = `SELECT a.id AS appointment_id, a.appointment_date, a.appointment_time, a.status, d.name AS doctor_name, d.specialization
               FROM appointments a JOIN doctors d ON a.doctor_id = d.id WHERE a.patient_id = ? ORDER BY a.appointment_date DESC`;
  db.query(sql, [pid], (err, rows) => {
    if (err) return res.status(500).json({ error: 'DB error', details: err.message || err });
    res.json(rows);
  });
});

module.exports = router;
