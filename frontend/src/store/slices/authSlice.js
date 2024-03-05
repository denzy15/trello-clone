import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  _id: null,
  username: null,
  email: null,
  token: null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      state._id = action.payload._id;
      state.username = action.payload.username;
      state.email = action.payload.email;
      state.token = action.payload.token;
    },
    signOut: (state, action) => {
      state._id = null;
      state.username = null;
      state.email = null;
      state.token = null;
    },
    changeUsername: (state, action) => {
      state.username = action.payload;
    },
  },
});

export const { login, signOut, changeUsername } = authSlice.actions;
export default authSlice.reducer;
