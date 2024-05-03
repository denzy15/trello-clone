import { Add, Check } from "@mui/icons-material";
import {
  Avatar,
  IconButton,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import {
  convertUsernameForAvatar,
  getUserColor,
  isUserOnBoard,
} from "../utils";
import axiosInstance from "../axiosInterceptor";
import { SERVER_URL } from "../constants";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { getTheme } from "../theme";

const UserSearchResultItem = (props) => {
  const { _id, email, username } = props;

  const { currentBoard } = useSelector((state) => state.boards);
  const { mode } = useSelector((state) => state.theme);
  const theme = getTheme(mode);

  const [invited, setInvited] = useState(false);

  const handleInvite = async () => {
    await axiosInstance
      .post(`${SERVER_URL}/api/invite`, {
        boardId: currentBoard._id,
        invitedUser: _id,
      })
      .then(() => {
        setInvited(true);
      })
      .catch((e) => {
        toast.warn(
          e.response.data.message || "Не удалось пригласить пользователя"
        );
      });
  };

  const isOnBoard = isUserOnBoard(_id, currentBoard);

  return (
    <ListItem
      sx={{
        bgcolor: isOnBoard ? theme.palette.action.disabledBackground : null,
      }}
      secondaryAction={
        <IconButton onClick={handleInvite} disabled={invited || isOnBoard}>
          {invited ? <Check sx={{ color: "green" }} /> : <Add />}
        </IconButton>
      }
    >
      <ListItemAvatar>
        <Avatar sx={{ bgcolor: getUserColor(_id) }}>
          {convertUsernameForAvatar(username)}
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={username}
        secondary={
          <>
            <Typography
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                fontSize: 12,
                display: "block",
              }}
              variant="caption"
            >
              {email}
            </Typography>
            {isOnBoard && (
              <Typography variant="caption">Участник доски</Typography>
            )}
          </>
        }
      />
    </ListItem>
  );
};

export default UserSearchResultItem;
