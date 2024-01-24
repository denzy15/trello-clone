import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  boards: [],
};

export const boardsSlice = createSlice({
  name: "boards",
  initialState,
  reducers: {
    setBoards: (state, action) => {
      state.boards = action.payload;
    },
  },
});

export const { setBoards } = boardsSlice.actions;
export default boardsSlice.reducer;
