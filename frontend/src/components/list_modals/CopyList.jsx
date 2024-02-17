import { Box, Button, TextField } from "@mui/material";
import React, { useRef, useState } from "react";
import axiosInstance from "../../axiosInterceptor";
import { SERVER_URL } from "../../constants";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { createList } from "../../store/slices/boardsSlice";

const CopyList = (props) => {
  const { title, _id, handleCloseModal } = props;

  const [newListTitle, setNewListTitle] = useState(title);

  const { boardId } = useParams();

  const dispatch = useDispatch();

  const inputRef = useRef(null);

  const handleCopyList = async () => {
    await axiosInstance
      .put(`${SERVER_URL}/api/lists/${boardId}/copy/${_id}`, {
        title: newListTitle,
      })
      .then(({ data }) => {
        dispatch(createList(data));
      })
      .catch((e) => {
        console.log(e);
        toast.error("Не удалось скопировать список");
      })
      .finally(() => {
        handleCloseModal();
      });
  };

  return (
    <Box sx={{ mt: 2 }}>
      <TextField
        label="Название"
        value={newListTitle}
        fullWidth
        onChange={(e) => setNewListTitle(e.target.value)}
        inputRef={inputRef}
      />
      <Button
        size="small"
        variant="contained"
        sx={{ my: 2 }}
        onClick={handleCopyList}
      >
        Копировать
      </Button>
    </Box>
  );
};

export default CopyList;
