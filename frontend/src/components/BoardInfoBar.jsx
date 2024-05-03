import {
  ArrowBack,
  Delete,
  Info,
  MoreHoriz,
  PersonAdd,
} from "@mui/icons-material";
import {
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import MainBoardModal from "./board_modals/MainBoardModal";
import AboutBoard from "./board_modals/AboutBoard";
import DeleteBoard from "./board_modals/DeleteBoard";
import AddUser from "./board_modals/AddUser";
import LeaveBoard from "./board_modals/LeaveBoard";
import { useDispatch, useSelector } from "react-redux";
import { toggleEditableDraft } from "../store/slices/metadataSlice";
import axiosInstance from "../axiosInterceptor";
import { useParams } from "react-router-dom";
import { SERVER_URL } from "../constants";
import { toast } from "react-toastify";
import { updateBoardTitle } from "../store/slices/boardsSlice";
import BackgroundPicker from "./board_modals/BackgroundPicker";

const steps = [
  {
    title: "Дополнительно:",
    component: MainBoardModal,
  },
  { title: "О доске", component: AboutBoard },
  { title: "Участники", component: AddUser },
  { title: "Сменить фон", component: BackgroundPicker },
  {
    title: "Покинуть доску",
    component: LeaveBoard,
  },
  {
    title: "Удалить доску",
    component: DeleteBoard,
  },
];

const BoardInfoBar = (props) => {
  // debugger
  const [openDrawer, setOpenDrawer] = useState(false);

  const [modalState, setModalState] = useState(steps[0]);

  const handleClick = (index) => {
    setModalState(steps[index]);
  };

  const dispatch = useDispatch();
  const { editableDraft } = useSelector((state) => state.metadata);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState(props.title);

  const { boardId } = useParams();

  const handleEditTitle = async (e) => {
    if (e.type === "keydown" && e.key !== "Enter") return;

    if (!newTitle || newTitle === props.title) {
      setNewTitle(props.title);
      setIsEditingTitle(false);
      return;
    }

    await axiosInstance
      .put(`${SERVER_URL}/api/boards/${boardId}`, {
        title: newTitle,
      })
      .then(() => {
        dispatch(updateBoardTitle(newTitle));
      })
      .catch((e) => {
        setNewTitle(props.title);
        toast.error(
          e.response.data.message || "Не удалось обновить название доски"
        );
      });

    setIsEditingTitle(false);
  };

  const handleCloseDrawer = () => {
    setOpenDrawer(false);
    if (editableDraft) dispatch(toggleEditableDraft());
    setModalState(steps[0]);
  };

  return (
    <>
      <Stack
        direction={"row"}
        sx={{
          alignItems: "center",
          justifyContent: "space-between",
          bgcolor: "rgba(0, 0, 0, 0.75)",
          p: 2,
          borderBottom: "1px solid #b7b7b7",
          color: "white",
        }}
      >
        {isEditingTitle ? (
          <TextField
            value={newTitle}
            autoFocus
            onBlur={handleEditTitle}
            onKeyDown={handleEditTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
        ) : (
          <Typography
            variant="h5"
            sx={{
              cursor: "pointer",
              display: "inline-block",
            }}
            onClick={() => setIsEditingTitle(true)}
          >
            {newTitle || props.title}
          </Typography>
        )}
        <IconButton color="inherit" onClick={() => setOpenDrawer(true)}>
          <MoreHoriz />
        </IconButton>
      </Stack>
      <Drawer anchor="right" open={openDrawer} onClose={handleCloseDrawer}>
        <Box sx={{ minWidth: 300, p: 1, maxWidth: 500 }}>
          <Stack
            direction={"row"}
            alignItems={"start"}
            spacing={6}
            sx={{ mb: 1 }}
          >
            <Box sx={{ width: 30 }}>
              {modalState.title !== steps[0].title && (
                <IconButton onClick={() => setModalState(steps[0])}>
                  <ArrowBack />
                </IconButton>
              )}
            </Box>
            <Typography sx={{ mb: 2, py: 1, fontWeight: 500, fontSize: 16 }}>
              {modalState.title}
            </Typography>
          </Stack>
          <Divider />
          {<modalState.component handleClick={handleClick} {...props} />}
        </Box>
      </Drawer>
    </>
  );
};

export default BoardInfoBar;
