const mongoose = require("mongoose");
const shortid = require("shortid");

const linkSchema = new mongoose.Schema({
  shortId: { type: String, default: shortid.generate, unique: true },
  longURL: { type: String, required: true, unique: true },
  androidLink: { type: String },
  iosLink: { type: String },
  userType: { type: String, enum: ["customer", "supplier", "organization", "default"] },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Link", linkSchema);
