const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { calculateRoutes } = require('../algorithms/routingEngine');

// Get all graph nodes and edges
router.get('/network', async (req, res) => {
  try {
    const nodes = await pool.query('SELECT id, name, latitude, longitude FROM nodes');
    const edges = await pool.query('SELECT * FROM road_segments');
    res.json({ nodes: nodes.rows, edges: edges.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Calculate fastest vs shortest route
router.get('/route', async (req, res) => {
  const { originId, destinationId } = req.query;
  try {
    const nodesRes = await pool.query('SELECT id, name, latitude, longitude FROM nodes');
    const edgesRes = await pool.query('SELECT * FROM road_segments');
    
    const result = calculateRoutes(
      nodesRes.rows,
      edgesRes.rows,
      parseInt(originId),
      parseInt(destinationId)
    );

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;