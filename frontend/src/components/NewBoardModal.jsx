import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  IconButton,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { toast } from "react-toastify";
import axiosInstance from "../axiosInterceptor";
import { SERVER_URL } from "../constants";
import { useDispatch } from "react-redux";
import { addBoard } from "../store/slices/boardsSlice";

const NewBoardModal = ({ close }) => {
  const ref = useRef();
  const dispatch = useDispatch();

  const handleClickOutside = (event) => {
    if (ref.current && !ref.current.contains(event.target)) close();
  };

  const [title, setTitle] = useState("");

  const createBoard = async () => {
    try {
      await axiosInstance
        .post(`${SERVER_URL}/api/boards`, { title })
        .then(({ data }) => {
          dispatch(addBoard(data));
          close();
        });
    } catch (e) {
      toast.error(e.response.data.message ||"Не удалось создать доску, попробуйте позже");
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <Paper
      ref={ref}
      elevation={5}
      sx={{
        p: 3,
        position: "absolute",
        top: 0,
        rights: 0,
        transform: "translate(50%, 10%)",
        zIndex: 4,
        minWidth: 300,
      }}
    >
      <IconButton
        sx={{ position: "absolute", right: 2, top: 2 }}
        onClick={(e) => {
          e.stopPropagation();
          close();
        }}
      >
        <CloseIcon />
      </IconButton>
      <Typography
        variant="h6"
        sx={{ fontWeight: 500, textAlign: "center", mb: 3 }}
      >
        Новая доска
      </Typography>
      <TextField
        label={"Заголовок доски"}
        fullWidth
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <Button
        variant="contained"
        sx={{ mt: 2, mx: "auto", display: "block" }}
        disabled={!title}
        onClick={createBoard}
      >
        Создать
      </Button>
    </Paper>
  );
};

export default NewBoardModal;
