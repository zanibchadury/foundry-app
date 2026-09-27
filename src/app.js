const express = require("express");
const cors = require("cors");
const path = require("path");

const ideaRoutes = require("./routes/idea.routes");

const app = express();

app.use(cors());
app.use(express.json());

// API
app.use("/api/ideas", ideaRoutes);

// Health check for Docker/EC2 monitoring
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

// Serve the frontend
app.use(express.static(path.join(__dirname, "..", "public")));

app.use("/api", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Server error", error: err.message });
});

module.exports = app;
