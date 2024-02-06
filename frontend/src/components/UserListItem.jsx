import {
  Avatar,
  Checkbox,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import React from "react";
import { convertUsernameForAvatar, getUserColor } from "../utils";

const UserListItem = ({ user, disabled, handleAssignUser, checked }) => {



  return (
    <ListItem
      secondaryAction={
        <Checkbox
          disabled={disabled}
          edge="end"
          onChange={() => handleAssignUser(user)}
          checked={checked}
        />
      }
      disablePadding
    >
      <ListItemButton
        disabled={disabled}
        onClick={() => handleAssignUser(user)}
      >
        <ListItemAvatar>
          <Avatar sx={{ bgcolor: getUserColor(user._id) }}>
            {convertUsernameForAvatar(user.username)}
          </Avatar>
        </ListItemAvatar>
        <ListItemText>
          {user.username} ({user.email})
        </ListItemText>
      </ListItemButton>
    </ListItem>
  );
};

export default UserListItem;
