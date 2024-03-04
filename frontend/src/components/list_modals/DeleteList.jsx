import { Box, Button, Typography } from "@mui/material";
import React from "react";
import { useDispatch } from "react-redux";
import { deleteList } from "../../store/slices/boardsSlice";
import axiosInstance from "../../axiosInterceptor";
import { useParams } from "react-router-dom";
import { SERVER_URL } from "../../constants";
import { toast } from "react-toastify";

const DeleteList = (props) => {
  const { _id, index, handleCloseModal } = props;
  const { boardId } = useParams();
  const dispatch = useDispatch();

  const handleDeleteList = async () => {
    await axiosInstance
      .delete(`${SERVER_URL}/api/lists/${boardId}/${_id}`)
      .then(() => {
        dispatch(deleteList({ listIndex: index }));
      })
      .catch((e) => {
        toast.error(e.response.data.message || "Не удалось удалить список");
      })
      .finally(() => {
        handleCloseModal();
      });
  };

  return (
    <Box sx={{ p: 1 }}>
      <Typography variant="body2">
        Вы уверены что хотите удалить список? Все карточки, находящиеся в этом
        списке будут также удалены
      </Typography>
      <Button
        color="error"
        variant="contained"
        sx={{ mt: 1.5 }}
        onClick={handleDeleteList}
      >
        Удалить
      </Button>
    </Box>
  );
};

export default DeleteList;
