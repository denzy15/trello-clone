import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  recent: [],
};

export const metadataSlice = createSlice({
  name: "metadata",
  initialState,
  reducers: {
    visitBoard: (state, action) => {
      if (!state.recent.includes(action.payload)) {
        state.recent = [...state.recent, action.payload];
        return;
      }

      const index = state.recent.indexOf(action.payload);

      if (index > 0) {
        state.recent.splice(index, 1).push(action.payload);
      }
    },
    clearRecent: (state, action) => {
      state.recent = [];
    },
  },
});

export const { visitBoard, clearRecent } = metadataSlice.actions;
export default metadataSlice.reducer;
