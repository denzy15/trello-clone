import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  boards: [],
  currentBoard: {},
};

export const boardsSlice = createSlice({
  name: "boards",
  initialState,
  reducers: {
    setBoards: (state, action) => {
      state.boards = action.payload;
    },
    addBoard: (state, action) => {
      state.boards.push(action.payload);
    },
    pickBoard: (state, action) => {
      state.currentBoard = action.payload;
    },
    quitBoard: (state, action) => {
      state.currentBoard = {};
    },
    updateListOrder: (state, action) => {
      state.currentBoard.lists = action.payload;
    },
    renameList: (state, action) => {
      state.currentBoard.lists[action.payload.listIndex].title =
        action.payload.title;
    },
    renameCard: (state, action) => {
      state.currentBoard.lists[action.payload.listIndex].cards[
        action.payload.cardIndex
      ].title = action.payload.title;
    },

    updateCardOrder: (state, action) => {
      state.currentBoard.lists[action.payload.listIndex].cards =
        action.payload.cards;
    },
    createCard: (state, action) => {
      state.currentBoard.lists[action.payload.listIndex].cards.push(
        action.payload.card
      );
    },
    createList: (state, action) => {
      state.currentBoard.lists.push(action.payload);
    },

    changeCardAssignedUsers: (state, action) => {
      state.currentBoard.lists[action.payload.listIndex].cards[
        action.payload.cardIndex
      ].assignedUsers = action.payload.assignedUsers;
    },
    changeCardLabels: (state, action) => {
      state.currentBoard.lists[action.payload.listIndex].cards[
        action.payload.cardIndex
      ].labels = action.payload.labels;
    },
    updateLabel: (state, action) => {
      state.currentBoard.labels = state.currentBoard.labels.map((l) =>
        l._id === action.payload._id ? action.payload : l
      );
    },
    addLabel: (state, action) => {
      state.currentBoard.labels.push(action.payload);
    },

    deleteLabel: (state, action) => {
      state.currentBoard.labels = state.currentBoard.labels.filter(
        (l) => l._id !== action.payload._id
      );
    },

    updateBoardCardDates: (state, action) => {
      state.currentBoard.lists[action.payload.listIndex].cards[
        action.payload.cardIndex
      ].startDate = action.payload.startDate;
      state.currentBoard.lists[action.payload.listIndex].cards[
        action.payload.cardIndex
      ].dueDate = action.payload.dueDate;
    },

    updateCard: (state, action) => {
      state.currentBoard.lists[action.payload.listIndex].cards[
        action.payload.cardIndex
      ] = action.payload.card;
    },

    updateLists: (state, action) => {
      state.currentBoard.lists = action.payload;
    },

    updateList: (state, action) => {
      state.currentBoard.lists[action.payload.listIndex] = action.payload.list;
    },

    deleteList: (state, action) => {
      state.currentBoard.lists.splice(action.payload.listIndex, 1);
    },

    updateUsers: (state, action) => {
      state.currentBoard.users = action.payload;
    },

    updateBoardDescription: (state, action) => {
      state.currentBoard.description = action.payload;
    },
  },
});

export const {
  updateUsers,
  updateBoardDescription,
  updateList,
  deleteList,
  updateCard,
  updateBoardCardDates,
  updateLists,
  updateLabel,
  addLabel,
  deleteLabel,
  changeCardAssignedUsers,
  changeCardLabels,
  setBoards,
  renameCard,
  createCard,
  createList,
  updateCardOrder,
  addBoard,
  pickBoard,
  quitBoard,
  updateListOrder,
  renameList,
} = boardsSlice.actions;
export default boardsSlice.reducer;
