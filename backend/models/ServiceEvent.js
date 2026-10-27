const mongoose = require("mongoose");

const serviceEventSchema = new mongoose.Schema({
  service: { type: String, required: true },
  status: { type: String, enum: ["UP", "DOWN"], required: true },
  message: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("ServiceEvent", serviceEventSchema);
