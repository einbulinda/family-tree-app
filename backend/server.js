const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Family Tree API is running..." });
});

// Import routes
const authRoutes = require("./routes/auth");
const individualsRoutes = require("./routes/individuals");
const invitationsRoutes = require("./routes/invitations");

app.use("/api/auth", authRoutes);
app.use("/api/individuals", individualsRoutes);
app.use("/api/invitations", invitationsRoutes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});
