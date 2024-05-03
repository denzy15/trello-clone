import {
  Avatar,
  Box,
  Button,
  ButtonGroup,
  IconButton,
  Paper,
  Popover,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import {
  convertUsernameForAvatar,
  formatDateWithourYear,
  getContrastColor,
  getUserColor,
} from "../utils";
import { useSelector } from "react-redux";
import Close from "@mui/icons-material/Close";

const Comment = (props) => {
  const currentUserInfo = useSelector((state) => state.auth);
  const { currentBoard } = useSelector((state) => state.boards);

  const {
    author,
    message,
    createdAt,
    updatedAt,
    _id,
    handleUpdateComment,
    handleDeleteComment,
  } = props;

  const [anchorEl, setAnchorEl] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [newMessage, setNewMessage] = useState(message);

  return (
    <Stack direction={"row"} spacing={1} alignItems={"center"}>
      <Tooltip title={author.username + ` (${author.email})`}>
        <Avatar
          sx={{
            bgcolor: getUserColor(author._id),
            color: getContrastColor(getUserColor(author._id)),
          }}
        >
          {convertUsernameForAvatar(author.username)}
        </Avatar>
      </Tooltip>
      <Box sx={{ flexGrow: 1 }}>
        <Box sx={{ display: "flex", gap: 1, pl: 0.5 }}>
          <Typography sx={{ fontWeight: 500 }}>{author.username}</Typography>
          <Typography variant="caption" sx={{ fontSize: 12 }}>
            {!updatedAt
              ? formatDateWithourYear(createdAt)
              : formatDateWithourYear(updatedAt)}
          </Typography>
          {updatedAt && (
            <Typography variant="caption" sx={{ fontSize: 12 }}>
              (изменён)
            </Typography>
          )}
        </Box>
        {isEditing ? (
          <TextField
            value={newMessage}
            autoFocus
            name="title"
            size="small"
            onChange={(e) => setNewMessage(e.target.value)}
          />
        ) : (
          <Paper elevation={3} sx={{ p: 1 }}>
            {newMessage}
          </Paper>
        )}
        {isEditing && (
          <Button
            onClick={() => {
              handleUpdateComment(_id, newMessage);
              setIsEditing(false);
            }}
          >
            Сохранить
          </Button>
        )}

        {(currentUserInfo._id === author._id ||
          currentBoard.creator._id === currentUserInfo._id) &&
          !isEditing && (
            <ButtonGroup
              sx={{ mt: 1 }}
              color="inherit"
              size="small"
              variant="text"
            >
              <Button
                disabled={currentUserInfo._id !== author._id}
                sx={{ fontSize: 10 }}
                onClick={() => setIsEditing(true)}
              >
                Изменить
              </Button>
              <Button
                sx={{ fontSize: 10 }}
                onClick={(e) => setAnchorEl(e.currentTarget)}
              >
                Удалить
              </Button>
            </ButtonGroup>
          )}

        <Popover
          open={!!anchorEl}
          anchorEl={anchorEl}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
        >
          <Box sx={{ position: "relative", p: 2, maxWidth: 300 }}>
            <IconButton
              sx={{ position: "absolute", right: 0, top: 0 }}
              onClick={() => setAnchorEl(null)}
            >
              <Close />
            </IconButton>
            <Typography sx={{ textAlign: "center", mb: 1 }} variant="h6">
              Удаление комментария
            </Typography>
            <Typography variant="body2">
              Комментарий удаляется навсегда. Отмена невозможна.
            </Typography>
            <Button
              color="error"
              variant="contained"
              sx={{ mt: 1.5 }}
              onClick={() => {
                handleDeleteComment(_id);
              }}
            >
              Удалить
            </Button>
          </Box>
        </Popover>
      </Box>
    </Stack>
  );
};

export default Comment;
