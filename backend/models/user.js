import { Schema, model } from "mongoose";

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  invitations: [
    {
      type: Schema.Types.ObjectId,
      ref: "Invitation",
    },
  ],
});

const User = model("User", userSchema);

export default User;
