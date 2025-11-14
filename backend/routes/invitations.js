const express = require("express");
const pool = require("../db/connection");
const { authenticateToken, authorizeAdmin } = require("../middleware/auth");

const router = express.Router();

// Invite user by email (admin only)
router.post("/", authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { email } = req.body;
    const invitedByUserId = req.user.id;

    // Check if email already exists in users
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    // Check if invitation already exists
    const existingInvitation = await pool.query(
      "SELECT * FROM invitations WHERE email = $1",
      [email]
    );

    if (existingInvitation.rows.length > 0) {
      return res.status(400).json({ message: "User already invited" });
    }

    // Create invitation
    const result = await pool.query(
      "INSERT INTO invitations (email, invited_by_user_id) VALUES ($1, $2) RETURNING *",
      [email, invitedByUserId]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Invite user error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get pending invitations (admin only)
router.get("/pending", authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT i.*, u.name as invited_by_name 
       FROM invitations i 
       JOIN users u ON i.invited_by_user_id = u.id 
       WHERE i.status = 'pending' 
       ORDER BY i.created_at DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Get pending invitations error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Approve user (admin only)
router.put(
  "/approve/:email",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    try {
      const { email } = req.params;

      // Update invitation status
      const invitationResult = await pool.query(
        "UPDATE invitations SET status = $1 WHERE email = $2 AND status = $3 RETURNING *",
        ["accepted", email, "pending"]
      );

      if (invitationResult.rows.length === 0) {
        return res
          .status(404)
          .json({ message: "Invitation not found or already processed" });
      }

      // Update user approval status
      const userResult = await pool.query(
        "UPDATE users SET is_approved = $1 WHERE email = $2 RETURNING *",
        [true, email]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        message: "User approved successfully",
        user: userResult.rows[0],
        invitation: invitationResult.rows[0],
      });
    } catch (error) {
      console.error("Approve user error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Reject invitation (admin only)
router.put(
  "/reject/:email",
  authenticateToken,
  authorizeAdmin,
  async (req, res) => {
    try {
      const { email } = req.params;

      const result = await pool.query(
        "UPDATE invitations SET status = $1 WHERE email = $2 AND status = $3 RETURNING *",
        ["rejected", email, "pending"]
      );

      if (result.rows.length === 0) {
        return res
          .status(404)
          .json({ message: "Invitation not found or already processed" });
      }

      res.json({
        message: "Invitation rejected successfully",
        invitation: result.rows[0],
      });
    } catch (error) {
      console.error("Reject invitation error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;
