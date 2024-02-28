import mongoose, { Schema } from "mongoose";

const InvitationSchema = new Schema({
  board: { type: Schema.Types.ObjectId, ref: "Board" },
  invitedUser: { type: Schema.Types.ObjectId, ref: "User" },
  inviter: { type: Schema.Types.ObjectId, ref: "User" },
  status: {
    type: String,
    enum: ["pending", "accepted", "declined"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
});

const Invitation = mongoose.model("Invitation", InvitationSchema);

export default Invitation;
