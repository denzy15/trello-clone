import {
  Avatar,
  AvatarGroup,
  Box,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import React from "react";
import { Draggable } from "react-beautiful-dnd";
import { useDispatch, useSelector } from "react-redux";
import {
  startCardEdit,
  toggleExtendedLabels,
} from "../store/slices/metadataSlice";
import {
  convertUsernameForAvatar,
  formatDateWithourYear,
  getContrastColor,
  getUserColor,
  isExpired,
} from "../utils";
import {
  AttachFile,
  ChatBubbleOutlineOutlined,
  QueryBuilder,
  Subject,
} from "@mui/icons-material";
import { getTheme } from "../theme";

const BoardCard = (props) => {
  const { extendedLabels } = useSelector((state) => state.metadata);
  const { mode } = useSelector((state) => state.theme);

  const theme = getTheme(mode);

  const dispatch = useDispatch();

  const handleOpenModal = () => {
    dispatch(startCardEdit(props));
  };

  const handleToggleLabels = (e) => {
    e.stopPropagation();
    dispatch(toggleExtendedLabels());
  };

  return (
    <Draggable draggableId={props._id} index={props.index}>
      {(provided, sn) => {
        return (
          <Paper
            onClick={handleOpenModal}
            elevation={2}
            sx={{ p: 1, bgcolor: theme.palette.background.default }}
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            <Box>
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  flexWrap: "wrap",
                  mb: !!props.labels.length && 1,
                }}
                onClick={handleToggleLabels}
              >
                {props.labels.map((lbl, i) => (
                  <Typography
                    key={i}
                    sx={{
                      px: 0.5,
                      minWidth: 40,
                      minHeight: 8,
                      bgcolor: lbl.color,
                      fontSize: 12,
                      borderRadius: 1.5,
                      color: getContrastColor(lbl.color),
                      transition: "0.3s",
                      cursor: "pointer",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      "&:hover": {
                        opacity: 0.9,
                      },
                    }}
                  >
                    {extendedLabels && lbl.title}
                  </Typography>
                ))}
              </Box>
              <Typography sx={{ fontWeight: 500 }}>{props.title}</Typography>
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  flexWrap: "wrap",
                  cursor: "pointer",
                  alignItems: "center",
                  mt: 1,
                }}
              >
                {!!props.dueDate && (
                  <Tooltip title="Срок карточки">
                    <Stack
                      direction={"row"}
                      alignItems={"center"}
                      spacing={0.25}
                      sx={{
                        p: 0.3,
                        bgcolor: isExpired(props.dueDate) ? "#FFD5D2" : null,
                        color: isExpired(props.dueDate)
                          ? "red"
                          : theme.palette.text.primary,
                      }}
                    >
                      <QueryBuilder sx={{ fontSize: 14 }} />
                      <Typography variant="subtitle2">
                        {formatDateWithourYear(props.dueDate)}
                      </Typography>
                    </Stack>
                  </Tooltip>
                )}

                {!!props.attachments.length && (
                  <Tooltip title={"Вложения"}>
                    <Stack
                      direction={"row"}
                      alignItems={"center"}
                      spacing={0.25}
                    >
                      <AttachFile
                        sx={{ transform: "rotate(45deg)", fontSize: 14 }}
                      />
                      <Typography variant="subtitle2">
                        {props.attachments.length}
                      </Typography>
                    </Stack>
                  </Tooltip>
                )}

                {!!props.comments.length && (
                  <Tooltip title={"Комментарии"}>
                    <Stack
                      direction={"row"}
                      alignItems={"center"}
                      spacing={0.25}
                    >
                      <ChatBubbleOutlineOutlined sx={{ fontSize: 14 }} />
                      <Typography variant="subtitle2">
                        {props.comments.length}
                      </Typography>
                    </Stack>
                  </Tooltip>
                )}

                {!!props.description && (
                  <Tooltip title={"Имеется описание"}>
                    <Subject sx={{ fontSize: 18 }} />
                  </Tooltip>
                )}
              </Box>
              <Stack direction={"row"}>
                {props.assignedUsers.length > 0 && (
                  <AvatarGroup
                    key={props._id}
                    max={3}
                    sx={{
                      cursor: "pointer",
                      ml: "auto",
                      "& .MuiAvatarGroup-avatar": {
                        width: 24,
                        height: 24,
                        fontSize: 12,
                      },
                    }}
                  >
                    {props.assignedUsers.map((user, idx) => (
                      <Tooltip
                        key={idx}
                        title={user.username + ` (${user.email})`}
                      >
                        <Avatar
                          key={idx}
                          sx={{
                            bgcolor: getUserColor(user._id),
                            color: getContrastColor(getUserColor(user._id)),
                          }}
                        >
                          {convertUsernameForAvatar(user.username)}
                        </Avatar>
                      </Tooltip>
                    ))}
                  </AvatarGroup>
                )}
              </Stack>
            </Box>
          </Paper>
        );
      }}
    </Draggable>
  );
};

export default BoardCard;
