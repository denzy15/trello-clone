import { Schema, model } from "mongoose";

const cardSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: { type: String, default: "" },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  startDate: { type: Date, default: null },
  dueDate: { type: Date, default: null },
  attachments: [
    {
      createdAt: {
        type: Date,
        default: () => new Date().toISOString(),
      },
      type: { type: String },
      path: String,
      creator: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      name: String,
    },
  ],
  assignedUsers: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  labels: [
    {
      title: String,
      color: String,
    },
  ],
  order: {
    type: Number,
    required: true,
  },
  comments: [
    {
      message: {
        type: String,
        required: true,
      },

      author: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      createdAt: {
        type: Date,
        default: () => new Date().toISOString(),
      },
      updatedAt: {
        type: Date,
        default: null,
      },
    },
  ],
});

const Card = model("Card", cardSchema);

export default Card;
