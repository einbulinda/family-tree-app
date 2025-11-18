const express = require("express");
const pool = require("../db/connection");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

//Get relationships for an individual
router.get("/individual/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT r.*, 
             i1.first_name as individual_first_name, 
             i1.last_name as individual_last_name,
             i2.first_name as related_first_name, 
             i2.last_name as related_last_name
      FROM relationships r
      JOIN individuals i1 ON r.individual_id = i1.id
      JOIN individuals i2 ON r.related_individual_id = i2.id
      WHERE r.individual_id = $1 OR r.related_individual_id = $1`,
      [id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Get relationships error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Create relationship between individuals
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { individual_id, related_individual_id, relationship_type } =
      req.body;

    // Verify user can create this relationship (either is their own profile or they're admin)
    const individualResult = await pool.query(
      "SELECT user_id FROM individuals WHERE id = $1",
      [individual_id]
    );

    const relatedResult = await pool.query(
      "SELECT user_id FROM individuals WHERE id = $1",
      [related_individual_id]
    );

    if (individualResult.rows.length === 0 || relatedResult.rows.length === 0) {
      return res.status(404).json({ message: "Individuals not found" });
    }

    // Check permissions
    const canCreate =
      req.user.role === "admin" ||
      individualResult.rows[0].user_id === req.user.id ||
      relatedResult.rows[0].user_id === req.user.id;

    if (!canCreate) {
      return res
        .status(403)
        .json({ message: "Not authorized to create this relationship" });
    }

    // Check if relationship already exists
    const existing = await pool.query(
      "SELECT * FROM relationships WHERE (individual_id = $1 AND related_individual_id = $2) OR (individual_id = $2 AND related_individual_id = $1)",
      [individual_id, related_individual_id]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "Relationship already exists" });
    }

    const result = await pool.query(
      "INSERT INTO relationships (individual_id, related_individual_id, relationship_type) VALUES ($1, $2, $3) RETURNING *",
      [individual_id, related_individual_id, relationship_type]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Create relationship error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete relationship
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM relationships WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Relationship not found" });
    }

    res.json({ message: "Relationship deleted successfully" });
  } catch (error) {
    console.error("Delete relationship error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
