const express = require("express");
const pool = require("../db/connection");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

//Get individual by ID
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`SELECT * FROM individuals WHERE id = $1`, [
      id,
    ]);

    if (result.rows.length === 0) {
      res.status(404).json({ mesage: "Individual not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Get individual error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

//Create a new Individual
router.post("/", authenticateToken, async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      birth_date,
      birth_place,
      death_date,
      death_place,
      is_alive,
      bio,
      photo_url,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO individuals (
        user_id, first_name, last_name, birth_date, birth_place, 
        death_date, death_place, is_alive, bio, photo_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
      RETURNING *`,
      [
        req.user.id,
        first_name,
        last_name,
        birth_date || null,
        birth_place || null,
        death_date || null,
        death_place || null,
        is_alive !== undefined ? true : is_alive,
        bio || null,
        photo_url || null,
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Create individual error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update individual
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      first_name,
      last_name,
      birth_date,
      birth_place,
      death_date,
      death_place,
      is_alive,
      bio,
      photo_url,
    } = req.body;

    // Check if user can edit this individual
    const individual = await pool.query(
      "SELECT * FROM individuals WHERE id = $1",
      [id]
    );

    if (individual.rows.length === 0) {
      return res.status(404).json({ message: "Individual not found" });
    }

    // Only allow user to edit their own profile or if they're admin
    if (
      individual.rows[0].user_id !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to edit this profile" });
    }

    const result = await pool.query(
      `UPDATE individuals SET 
        first_name = $1, 
        last_name = $2, 
        birth_date = $3, 
        birth_place = $4, 
        death_date = $5, 
        death_place = $6, 
        is_alive = $7, 
        bio = $8, 
        photo_url = $9,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $10 
      RETURNING *`,
      [
        first_name,
        last_name,
        birth_date || null,
        birth_place || null,
        death_date || null,
        death_place || null,
        is_alive,
        bio || null,
        photo_url || null,
        id,
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Update individual error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
