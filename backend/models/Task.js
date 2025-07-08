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
    dueDate: { type: Date },
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    attachments: [
      {
        filename: String,
        url: String,
        uploadedAt: { type: Date, default: Date.now },
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
      }
    ],
    dependencies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],
    version: { type: Number, default: 1 }, // ✅ Added version field
  },
  { timestamps: true }
);

taskSchema.index({ title: 1 }, { unique: true });

module.exports = mongoose.model("Task", taskSchema);
