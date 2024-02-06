import {
  Box,
  Button,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import CloseIcon from "@mui/icons-material/Close";
import { MuiColorInput } from "mui-color-input";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { colorIsDark } from "../utils";
import {
  addLabel,
  deleteLabel,
  updateLabel,
  updateLists,
} from "../store/slices/boardsSlice";
import {
  removeLabelFromCard,
  updateCardLabel,
} from "../store/slices/metadataSlice";
import axiosInstance from "../axiosInterceptor";
import { SERVER_URL } from "../constants";
import { toast } from "react-toastify";

const LabelEditor = (props) => {
  const [searchParams] = useSearchParams();

  const dispatch = useDispatch();

  const { currentBoard } = useSelector((state) => state.boards);

  const newLabel = searchParams.get("labelId") === "newLabel" ? true : false;

  const [currentLabel, setCurrentLabel] = useState(
    newLabel
      ? {
          title: "",
          color: "#dedede",
        }
      : currentBoard.labels.find((l) => l._id === searchParams.get("labelId"))
  );

  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const handleCreate = async () => {
    try {
      await axiosInstance
        .put(`${SERVER_URL}/api/boards/${currentBoard._id}/add-label`, {
          label: currentLabel,
        })
        .then(({ data }) => {
          dispatch(addLabel(data));
        });
    } catch (error) {
      toast.error("Не удалось создать метку. Попробуйте позже");
    } finally {
      back();
    }
  };

  const handleSave = async () => {
    try {
      await axiosInstance.put(
        `${SERVER_URL}/api/boards/${currentBoard._id}/update-label`,
        {
          label: currentLabel,
        }
      );

      await axiosInstance
        .get(`${SERVER_URL}/api/lists/${currentBoard._id}`)
        .then(({ data }) => {
          dispatch(updateLists(data));
        });
      dispatch(updateCardLabel(currentLabel));
      dispatch(updateLabel(currentLabel));
    } catch (error) {
      toast.error("Не удалось обновить метку. Попробуйте позже");
    } finally {
      back();
    }
  };

  const handleDelete = async () => {
    try {
      await axiosInstance.put(
        `${SERVER_URL}/api/boards/${currentBoard._id}/delete-label`,
        {
          label: currentLabel,
        }
      );

      await axiosInstance
        .get(`${SERVER_URL}/api/lists/${currentBoard._id}`)
        .then(({ data }) => {
          dispatch(updateLists(data));
        });

      dispatch(deleteLabel(currentLabel));
      dispatch(removeLabelFromCard(currentLabel));
    } catch (e) {
      toast.error("Не удалось удалить метку. Попробуйте позже");
    } finally {
      close();
    }
  };

  const { close, back } = props;

  return (
    <Paper
      sx={{
        position: "absolute",
        left: 0,
        top: 0,
        width: "100%",
        minHeight: "100%",
        pb: 2,
        zIndex: 20,
      }}
    >
      <Box
        sx={{
          width: "100%",
          height: "100%",
          opacity: 0.5,
          position: "absolute",
          left: 0,
          top: 0,
          zIndex: 22,
          bgcolor: "black",
          display: deleteConfirm ? "block" : "none",
        }}
      ></Box>
      <IconButton
        onClick={back}
        sx={{ position: "absolute", left: 10, top: 10 }}
      >
        <ArrowBackIosIcon fontSize="inherit" />
      </IconButton>
      <IconButton
        onClick={close}
        sx={{ position: "absolute", right: 10, top: 10 }}
      >
        <CloseIcon fontSize="inherit" />
      </IconButton>
      <Typography sx={{ textAlign: "center", pt: 2 }}>
        {newLabel ? "Создание " : "Изменение "} метки
      </Typography>
      <Box
        sx={{
          bgcolor: "#f7f8f9",
          height: 100,
          mt: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            bgcolor: currentLabel.color,
            width: "70%",
            height: 30,
            borderRadius: 2,
            p: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            color: colorIsDark(currentLabel.color) ? "#ffffff" : "#000000",
          }}
        >
          {currentLabel.title}
        </Box>
      </Box>
      <Box
        sx={{
          p: 2,
        }}
      >
        <TextField
          fullWidth
          size="small"
          value={currentLabel.title}
          label="Название"
          onChange={(e) =>
            setCurrentLabel((prev) => ({ ...prev, title: e.target.value }))
          }
          sx={{ mb: 2 }}
        />
        <MuiColorInput
          fullWidth
          label="Цвет"
          value={currentLabel.color}
          onChange={(newval) =>
            setCurrentLabel((prev) => ({ ...prev, color: newval }))
          }
        />
      </Box>
      {newLabel ? (
        <Button
          onClick={handleCreate}
          variant="contained"
          sx={{ mx: 2, mt: 2 }}
        >
          Создать
        </Button>
      ) : (
        <Stack
          direction={"row"}
          justifyContent={"space-between"}
          alignItems={"center"}
          sx={{ px: 2, mt: 2 }}
        >
          <Button variant="contained" onClick={handleSave}>
            Сохранить
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => setDeleteConfirm(true)}
          >
            Удалить
          </Button>
        </Stack>
      )}

      {deleteConfirm && (
        <Paper
          elevation={2}
          sx={{
            zIndex: 22,
            textAlign: "center",
            p: 2,
            position: "absolute",
            bgcolor: "InfoBackground",
            right: 0,
            bottom: 20,
          }}
        >
          <IconButton
            onClick={() => setDeleteConfirm(false)}
            size="small"
            sx={{ position: "absolute", left: 10, top: 10 }}
          >
            <ArrowBackIosIcon fontSize="inherit" />
          </IconButton>

          <Typography sx={{ mb: 2 }}>
            Метка будет удалена со всех карточек. Это действие нельзя отменить.
          </Typography>
          <Button variant="contained" color="error" onClick={handleDelete}>
            Удалить
          </Button>
        </Paper>
      )}
    </Paper>
  );
};

export default LabelEditor;
