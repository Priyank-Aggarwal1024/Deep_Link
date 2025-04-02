const mongoose = require("mongoose");
const shortid = require("shortid");
const MongooseDelete = require("mongoose-delete");

const linkSchema = new mongoose.Schema({
  shortId: { type: String, default: shortid.generate, unique: true },
  longURL: { type: String, required: true, unique: true },
  deepLink: { type: String },
  iosLink: { type: String },
  userType: { type: String, enum: ["customer", "supplier", "organization", "default"] },
  createdAt: { type: Date, default: Date.now },
});

linkSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  return next();
});

linkSchema.set("toJSON", {
  transform(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

linkSchema.plugin(MongooseDelete, {
  deletedAt: true,
  overrideMethods: true,
});

module.exports = mongoose.model("linkModel", linkSchema);