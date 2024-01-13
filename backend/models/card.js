import { Schema, model } from "mongoose";

const cardSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  dueDate: Date,
  attachments: [String],
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
});

const Card = model("Card", cardSchema);

export default Card;
