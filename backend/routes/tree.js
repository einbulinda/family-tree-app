const express = require("express");
const pool = require("../db/connection");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Get all individuals for tree visualization
router.get("/individuals", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, first_name, last_name, birth_date, birth_place, 
             death_date, death_place, is_alive, bio, photo_url, user_id
      FROM individuals
      ORDER BY last_name, first_name
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Get all individuals error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all relationships for tree visualization
router.get("/relationships", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.*, 
             i1.first_name as individual_first_name, 
             i1.last_name as individual_last_name,
             i2.first_name as related_first_name, 
             i2.last_name as related_last_name
      FROM relationships r
      JOIN individuals i1 ON r.individual_id = i1.id
      JOIN individuals i2 ON r.related_individual_id = i2.id
    `);

    // Format relationships for tree visualization
    const relationships = result.rows.map((rel) => ({
      id: rel.id,
      source: rel.individual_id,
      target: rel.related_individual_id,
      type: rel.relationship_type,
    }));

    res.json(relationships);
  } catch (error) {
    console.error("Get all relationships error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
