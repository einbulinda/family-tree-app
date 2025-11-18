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
const relationshipsRoutes = require("./routes/relationships");
const treeRoutes = require("./routes/tree");

app.use("/api/auth", authRoutes);
app.use("/api/individuals", individualsRoutes);
app.use("/api/invitations", invitationsRoutes);
app.use("/api/relationships", relationshipsRoutes);
app.use("/api/tree", treeRoutes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});
