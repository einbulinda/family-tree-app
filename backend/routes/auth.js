const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db/connection");

const router = express.Router();

//Register a new user
router.post("/register", async (req, res) => {
  try {
    const { email, name, password } = req.body;

    //Check is user exists
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0)
      return res.status(400).json({ message: "User already exists." });

    // TODO: Check if email is whitelisted (for now, we'll allow any email - we'll add whitelist logic later)
    // In production, check against invitations table

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    // Create User
    const result = await pool.query(
      "INSERT INTO users (email, name, password_hash) VALUES ($1,$2,$3) RETURNING id, email, name, role,is_approved",
      [email, name, hashPassword]
    );

    const user = result.rows[0];
    res.status(201).json({
      message: "User registered successfully. Awaiting admin approval.",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        is_approved: user.is_approved,
      },
    });
  } catch (error) {
    console.error("Registration error", error);
    res.status(500).json({ message: "Server error during registration" });
  }
});

//Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    //Find user
    const result = await pool.query("SELECT * FROM users WHERE email=$1", [
      email,
    ]);

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const user = result.rows[0];

    //Check if user is approved
    if (!user.is_approved) {
      return res.status(403).json({ message: "Account not approved yet" });
    }

    // Verify Password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    //Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
});

module.exports = router;
