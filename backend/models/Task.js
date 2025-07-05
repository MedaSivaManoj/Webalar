const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: {
      type: String,
      enum: ["Todo", "In Progress", "Done"],
      default: "Todo",
    },
    priority: { type: Number, default: 0 },
    version: { type: Number, default: 1 }, // ✅ Added version field
  },
  { timestamps: true }
);

taskSchema.index({ title: 1 }, { unique: true });

module.exports = mongoose.model("Task", taskSchema);
