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
import { colorIsDark, convertUsernameForAvatar, getUserColor } from "../utils";

const BoardCard = (props) => {
  const { extendedLabels } = useSelector((state) => state.metadata);

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
            sx={{ p: 1 }}
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
                      height: extendedLabels ? "auto" : 8,
                      width: extendedLabels ? "auto" : 40,
                      bgcolor: lbl.color,
                      fontSize: 12,
                      borderRadius: 1.5,
                      color: colorIsDark(lbl.color) ? "#ffffff" : "#000000",
                      transition: "0.3s",
                      cursor: "pointer",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      "&:hover": {
                        opacity: 0.9
                      }
                    }}
                  >
                    {extendedLabels && lbl.title}
                  </Typography>
                ))}
              </Box>
              <Typography sx={{ fontWeight: 500 }}>{props.title}</Typography>
              <Stack direction={"row"}>
                {props.assignedUsers.length > 0 && (
                  <AvatarGroup
                    key={props._id}
                    max={3}
                    sx={{
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
                          sx={{ bgcolor: getUserColor(user._id) }}
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
