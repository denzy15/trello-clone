import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  recent: [],
  cardEditing: {
    isEditing: false,
    card: null,
  },
  extendedLabels: false,
  editableDraft: false,
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
    startCardEdit: (state, action) => {
      state.cardEditing = {
        card: action.payload,
        isEditing: true,
      };
    },
    stopCardEdit: (state, action) => {
      state.cardEditing = {
        card: null,
        isEditing: false,
      };
      state.editableDraft = false;
    },

    addUserToCard: (state, action) => {
      state.cardEditing.card.assignedUsers.push(action.payload);
    },
    removeUserFromCard: (state, action) => {
      state.cardEditing.card.assignedUsers =
        state.cardEditing.card.assignedUsers.filter(
          (u) => u._id !== action.payload
        );
    },
    addLabelToCard: (state, action) => {
      state.cardEditing.card.labels.push(action.payload);
    },
    removeLabelFromCard: (state, action) => {
      state.cardEditing.card.labels = state.cardEditing.card.labels.filter(
        (l) => l._id !== action.payload._id
      );
    },
    updateCardLabel: (state, action) => {
      state.cardEditing.card.labels = state.cardEditing.card.labels.map((l) =>
        l._id === action.payload._id ? action.payload : l
      );
    },

    updateCardDates: (state, action) => {
      state.cardEditing.card.dueDate = action.payload.dueDate;
      state.cardEditing.card.startDate = action.payload.startDate;
    },

    updateCardDescription: (state, action) => {
      state.cardEditing.card.description = action.payload;
    },

    updateCardAttachments: (state, action) => {
      state.cardEditing.card.attachments = action.payload;
    },

    updateCardAttachName: (state, action) => {
      state.cardEditing.card.attachments[action.payload.index].name =
        action.payload.name;
    },

    deleteAttach: (state, action) => {
      state.cardEditing.card.attachments.splice(action.payload.index, 1);
    },

    updateComments: (state, action) => {
      state.cardEditing.card.comments = action.payload;
    },

    toggleExtendedLabels: (state, action) => {
      state.extendedLabels = !state.extendedLabels;
    },
    toggleEditableDraft: (state, action) => {
      state.editableDraft = !state.editableDraft;
    },
  },
});

export const {
  updateComments,
  deleteAttach,
  updateCardAttachName,
  updateCardAttachments,
  toggleEditableDraft,
  updateCardDescription,
  toggleExtendedLabels,
  updateCardDates,
  addLabelToCard,
  updateCardLabel,
  removeLabelFromCard,
  visitBoard,
  addUserToCard,
  removeUserFromCard,
  clearRecent,
  startCardEdit,
  stopCardEdit,
  updateCardEditingInfo,
} = metadataSlice.actions;
export default metadataSlice.reducer;
