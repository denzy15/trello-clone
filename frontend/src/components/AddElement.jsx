import {
  Box,
  Button,
  FormControl,
  IconButton,
  Stack,
  TextField,
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import axiosInstance from "../axiosInterceptor";
import { SERVER_URL } from "../constants";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { createCard, createList } from "../store/slices/boardsSlice";
import { getTheme } from "../theme";

const AddElement = ({
  isCreating,
  setIsCreating,
  type,
  boardId,
  listId,
  listIndex,
}) => {
  const inputRef = useRef();

  // const { currentBoard } = useSelector((state) => state.boards);
  const [title, setTitle] = useState("");

  const { mode } = useSelector((state) => state.theme);
  const theme = getTheme(mode);

  const dispatch = useDispatch();

  const handleClickOutside = (event) => {
    if (inputRef.current && !inputRef.current.contains(event.target)) {
      setIsCreating(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const createNewElementHandler = async () => {
    if (!title) {
      setIsCreating(false);
      return;
    }

    const requestUrl =
      type === "CARD"
        ? `${SERVER_URL}/api/cards/${boardId}/${listId}`
        : `${SERVER_URL}/api/lists/${boardId}`;

    await axiosInstance
      .post(requestUrl, {
        title,
      })
      .then(({ data }) => {
        type === "CARD"
          ? dispatch(
              createCard({
                listIndex,
                card: data,
              })
            )
          : dispatch(createList(data));
      })
      .catch((e) => {
        toast.error(
          e.response.data.message ||
            `Не удалось добавить ${
              type === "CARD" ? "карточку" : "список"
            }, повторите позже`
        );
      })
      .finally(() => {
        setIsCreating(false);
        setTitle("");
      });
  };

  return (
    <Box sx={{ mt: 2, minWidth: 200 }}>
      {!isCreating ? (
        <Button
          variant="text"
          fullWidth
          startIcon={<AddIcon />}
          sx={{ color: theme.palette.text.secondary }}
          onClick={() => setIsCreating(true)}
        >
          Добавить {type === "CARD" ? "карточку" : "новый список"}
        </Button>
      ) : (
        <FormControl ref={inputRef} fullWidth>
          <TextField
            autoComplete="off"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            placeholder={`Добавить заголовок ${
              type === "CARD" ? "карточки" : "списка"
            } `}
          />
          <Stack sx={{ mt: 1 }} spacing={1} direction={"row"}>
            <Button
              variant="contained"
              onClick={createNewElementHandler}
            >
              Добавить {type === "CARD" ? "карточку" : "новый список"}
            </Button>
            <IconButton
              aria-label="close"
              onClick={() => {
                setTitle("");
                setIsCreating(false);
              }}
            >
              <CloseIcon />
            </IconButton>
          </Stack>
        </FormControl>
      )}
    </Box>
  );
};

export default AddElement;
