import { Schema, model } from "mongoose";

const boardSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: { type: String, default: "" },
  creator: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  users: [
    {
      userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      role: {
        type: String,
        enum: ["ADMIN", "MEMBER"],
        default: "MEMBER",
      },
    },
  ],
  lists: [
    {
      type: Schema.Types.ObjectId,
      ref: "List",
    },
  ],
  labels: [
    {
      title: { type: String, default: "" },
      color: { type: String, default: "#FAFAFA" },
    },
  ],
  backgrounds: [
    {
      path: String,
      name: String,
    },
  ],
  currentBackground: {
    type: String,
    required: true,
    default: "backgrounds/common/snow.svg",
  },
});

const Board = model("Board", boardSchema);

export default Board;
