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
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  lists: [
    {
      type: Schema.Types.ObjectId,
      ref: "List",
    },
  ],
});

const Board = model("Board", boardSchema);

export default Board;
