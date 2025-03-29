const mongoose = require("mongoose");
const shortid = require("shortid");

const linkSchema = new mongoose.Schema({
  shortId: { type: String, default: shortid.generate, unique: true },
  longURL: { type: String, required: true },
  deepLink: { type: String },
  userType: { type: String, enum: ["customer", "supplier", "organization"] },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Link", linkSchema);
