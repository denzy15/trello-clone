import { Schema, model } from "mongoose";

const listSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  order: { type: Number, required: true },
  cards: [
    {
      type: Schema.Types.ObjectId,
      ref: "Card",
    },
  ],
});

const List = model("List", listSchema);

export default List;
