import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import axiosInstance from "../../axiosInterceptor";
import { SERVER_URL } from "../../constants";
import { toast } from "react-toastify";
import { updateLists } from "../../store/slices/boardsSlice";

const MoveCards = (props) => {
  const { _id, handleCloseModal } = props;
  const { currentBoard } = useSelector((state) => state.boards);
  // console.log(currentBoard.lists);

  const dispatch = useDispatch();

  const handleMove = async (resListId) => {
    await axiosInstance
      .put(`${SERVER_URL}/api/lists/${currentBoard._id}/move-cards`, {
        sourceListId: _id,
        resultListId: resListId,
      })
      .then(({ data }) => {
        dispatch(updateLists(data));
      })
      .catch((e) => {
        console.log(e);
        toast.error("Не удалось переместить карточки");
      })
      .finally(() => {
        handleCloseModal();
      });
  };

  return (
    <Box sx={{ p: 1 }}>
      {currentBoard.lists.map((list, idx) => (
        <List disablePadding key={idx}>
          <ListItemButton
            disabled={_id === list._id}
            onClick={() => handleMove(list._id)}
          >
            <ListItemText
              primary={list.title}
              secondary={_id === list._id && "текущий"}
            />
          </ListItemButton>
        </List>
      ))}
    </Box>
  );
};

export default MoveCards;
