import {
  Avatar,
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Popover,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import React, { useRef, useState } from "react";
import { convertUsernameForAvatar, getUserColor } from "../utils";
import { useDispatch, useSelector } from "react-redux";
import axiosInstance from "../axiosInterceptor";
import { SERVER_URL } from "../constants";
import { useParams } from "react-router-dom";
import { updateUsers } from "../store/slices/boardsSlice";
import { toast } from "react-toastify";

const BoardUser = (props) => {
  const { boardId } = useParams();

  const { currentBoard } = useSelector((state) => state.boards);

  const { _id, username, email, role } = props;

  const ref = useRef();
  const currentUser = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(false);

  const [deleteAnchorEl, setDeleteAnchorEl] = useState(null);

  const { role: myRole } = useSelector((state) => state.metadata);

  const dispatch = useDispatch();

  const ableToMakeMember = () => {
    if (
      currentUser._id === currentBoard.creator._id &&
      _id !== currentBoard.creator._id
    ) {
      return true;
    }

    if (
      myRole === "ADMIN" &&
      role !== "ADMIN" &&
      _id !== currentBoard.creator._id
    ) {
      return true;
    }

    return false;
  };

  const ableToMakeAdmin = () => {
    return currentUser._id === currentBoard.creator._id || myRole === "ADMIN"
      ? true
      : false;
  };

  const ableToKick = () => {
    if (
      currentUser._id === currentBoard.creator._id &&
      _id !== currentBoard.creator._id
    ) {
      return true;
    }

    if (_id !== currentBoard.creator._id) {
      return false;
    }

    if (myRole === "ADMIN" && role !== "ADMIN") {
      return true;
    }

    return false;
  };

  const handleDelete = async () => {
    setLoading(true);
    await axiosInstance
      .put(`${SERVER_URL}/api/boards/${boardId}/kick-user`, {
        userId: _id,
      })
      .then(({ data }) => {
        dispatch(updateUsers(data));
      })
      .catch((e) => {
        console.log(e);
        toast.error(
          e.response.data.message ||
            "Не удалось удалить пользователя, попробуйте позже"
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleChange = async (event) => {
    if (event.target.value === "delete") {
      setDeleteAnchorEl(ref.current);
      return;
    }

    if (event.target.value === "MEMBER" || event.target.value === "ADMIN") {
      if (event.target.value === role) return;

      setLoading(true);
      await axiosInstance
        .put(`${SERVER_URL}/api/boards/${boardId}/change-user-role`, {
          userId: _id,
          newRole: event.target.value,
        })
        .then(({ data }) => {
          dispatch(updateUsers(data));
        })
        .catch((e) => {
          toast.error(e.response.data.message || "Не удалось изменить роль");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  return (
    <Stack
      ref={ref}
      alignItems={"center"}
      spacing={1.5}
      direction={"row"}
      sx={{ mb: 1 }}
    >
      <Avatar sx={{ bgcolor: getUserColor(_id) }}>
        {convertUsernameForAvatar(username)}
      </Avatar>
      <Box sx={{ flex: 1 }}>
        <Typography>{username}</Typography>
        <Typography variant="subtitle2">{email}</Typography>
      </Box>
      <FormControl>
        <Select
          disabled={myRole !== "ADMIN" || loading}
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={role}
          onChange={handleChange}
        >
          <MenuItem value={"ADMIN"} disabled={!ableToMakeAdmin()}>
            Админ
          </MenuItem>
          <MenuItem value={"MEMBER"} disabled={!ableToMakeMember()}>
            Участник
          </MenuItem>
          <MenuItem value={"delete"} disabled={!ableToKick()}>
            Удалить
          </MenuItem>
        </Select>
      </FormControl>
      <Popover
        open={!!deleteAnchorEl}
        anchorEl={deleteAnchorEl}
        onClose={() => setDeleteAnchorEl(null)}
      >
        <Box sx={{ p: 2, maxWidth: 300 }}>
          <Typography>Удалить пользователя</Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Пользователь {username} будет удален со всех карточек на доске
          </Typography>
          <Button onClick={handleDelete} variant="contained" color="error">
            Удалить
          </Button>
        </Box>
      </Popover>
    </Stack>
  );
};

export default BoardUser;
