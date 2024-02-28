import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  invitations: [],
};

export const invitationsSlice = createSlice({
  name: "invitations",
  initialState,
  reducers: {
    setInvitations: (state, action) => {
      state.invitations = action.payload;
    },
    changeInvitationStatus: (state, action) => {
      for (const inv of state.invitations) {
        if (inv._id === action.payload._id) {
          inv.status = action.payload.status;
          break;
        }
      }
      // state.invitations = state.invitations.map((inv) =>
      //   inv._id === action.payload._id ? action.payload : inv
      // );
    },
    deleteInvitation: (state, action) => {
      state.invitations = state.invitations.filter(
        (inv) => inv._id !== action.payload._id
      );
    },
  },
});

export const { changeInvitationStatus, deleteInvitation, setInvitations } =
  invitationsSlice.actions;
export default invitationsSlice.reducer;
