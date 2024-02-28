import {
  Avatar,
  Box,
  Button,
  ButtonGroup,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import {
  convertUsernameForAvatar,
  formatDateWithourYear,
  getUserColor,
} from "../utils";
import { RemoveCircleOutline } from "@mui/icons-material";
import axiosInstance from "../axiosInterceptor";
import { SERVER_URL } from "../constants";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import {
  changeInvitationStatus,
  deleteInvitation,
} from "../store/slices/invitationsSlice";

const Notification = (props) => {
  // console.log(props);
  const { board, inviter, createdAt, _id, status } = props;

  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  const handleAccept = async () => {
    setLoading(true);
    await axiosInstance
      .put(`${SERVER_URL}/api/invite/accept`, {
        boardId: board._id,
        invitationId: _id,
      })
      .then(({ data }) => {
        dispatch(changeInvitationStatus(data));
      })
      .catch((e) => {
        console.log(e);
        toast.error("Не удалось принять приглашение, попробуйте позже");
      })
      .finally(() => {
        setLoading(false);
      });
  };
  const handleDecline = async () => {
    setLoading(true);
    await axiosInstance
      .put(`${SERVER_URL}/api/invite/decline`, {
        invitationId: _id,
      })
      .then(({ data }) => {
        dispatch(changeInvitationStatus(data));
      })
      .catch((e) => {
        console.log(e);
        toast.error("Не удалось отклонить приглашение, попробуйте позже");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleDelete = async () => {
    setLoading(true);
    await axiosInstance
      .delete(`${SERVER_URL}/api/invite/${_id}`)
      .then(({ data }) => {
        dispatch(deleteInvitation({ _id }));
      })
      .catch((e) => {
        console.log(e);
        toast.error("Не удалось удалить уведомление, попробуйте позже");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Box
      sx={{ bgcolor: "#eeeeee", borderRadius: 2, p: 1, position: "relative" }}
    >
      <IconButton
        onClick={handleDelete}
        sx={{ position: "absolute", right: 0, top: 0 }}
      >
        <RemoveCircleOutline />
      </IconButton>
      <Typography>Пользователь</Typography>

      <Stack direction={"row"} spacing={1} alignItems={"center"}>
        {" "}
        <Tooltip title={inviter.email}>
          <Avatar sx={{ bgcolor: getUserColor(inviter._id) }}>
            {convertUsernameForAvatar(inviter.username)}
          </Avatar>
        </Tooltip>
        <Typography>{inviter.username}</Typography>
      </Stack>
      <Typography>
        пригласил вас на доску{" "}
        <span style={{ textDecoration: "underline" }}>{board.title}</span>
      </Typography>
      <Typography variant="caption">
        {formatDateWithourYear(createdAt)}
      </Typography>
      <ButtonGroup
        disabled={status !== "pending" || loading}
        fullWidth
        sx={{ mt: 1 }}
      >
        <Button color="success" onClick={handleAccept}>
          Принять
        </Button>
        <Button color="error" onClick={handleDecline}>
          Отклонить
        </Button>
      </ButtonGroup>
      {status !== "pending" && (
        <Typography>
          {status === "accepted"
            ? "Вы уже приняли это приглашение"
            : status === "declined"
            ? "Вы уже отклонили это приглашение"
            : ""}
        </Typography>
      )}
    </Box>
  );
};

export default Notification;
