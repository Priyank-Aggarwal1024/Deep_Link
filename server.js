require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const connectDB = require("./config/db");

const app = express();
app.use(express.json());
app.use(cors());

connectDB();

// Serve Android assetlinks.json
app.get("/.well-known/assetlinks.json", (req, res) => {
  const filePath = path.join(__dirname, "public", "assetlinks.json");
  if (fs.existsSync(filePath)) {
    res.setHeader("Content-Type", "application/json");
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: "assetlinks.json not found" });
  }
});

// Serve iOS apple-app-site-association
app.get("/.well-known/apple-app-site-association", (req, res) => {
  const filePath = path.join(__dirname, "public", "apple-app-site-association");
  if (fs.existsSync(filePath)) {
    res.setHeader("Content-Type", "application/json");
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: "apple-app-site-association not found" });
  }
});

// Load Routes
app.use("/", require("./routes/linkRoutes"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
