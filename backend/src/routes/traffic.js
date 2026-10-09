const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Report congestion, closures, or events (e.g. Police interface / Telemetry)
router.post('/report', async (req, res) => {
  const { roadSegmentId, reportedBy, incidentType, severity, congestionFactor, isClosed, description } = req.body;
  
  try {
    // 1. Insert incident log
    await pool.query(
      `INSERT INTO traffic_reports (road_segment_id, reported_by, incident_type, severity, description)
       VALUES ($1, $2, $3, $4, $5)`,
      [roadSegmentId, reportedBy || 'Traffic Officer', incidentType, severity, description]
    );

    // 2. Update active road segment metadata
    await pool.query(
      `UPDATE road_segments 
       SET congestion_factor = COALESCE($1, congestion_factor),
           is_closed = COALESCE($2, is_closed),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [congestionFactor, isClosed, roadSegmentId]
    );

    res.json({ status: 'Success', message: 'Traffic condition updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ingest GPS telemetry from ESP32 vehicle units
router.post('/telemetry', async (req, res) => {
  const { deviceId, latitude, longitude, speedKmh } = req.body;
  console.log(`[Telemetry] Device: ${deviceId} | Speed: ${speedKmh} km/h | Lat: ${latitude}, Lon: ${longitude}`);
  
  // Here telemetry logic can dynamically detect speed drops on segments
  res.json({ status: 'ACK', timestamp: new Date().toISOString() });
});

module.exports = router;