import {
  Checkbox,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import React from "react";
import { colorIsDark } from "../utils";
import { useSearchParams } from "react-router-dom";

const LabelListItem = ({
  disabled,
  checked,
  label,
  handleAssignLabel,
  startEdit,
}) => {
  const isDarkBackground = colorIsDark(label.color);
  const [searchParams, setSearchParams] = useSearchParams();

  return (
    <ListItem disablePadding sx={{ mb: 1 }}>
      <ListItemIcon>
        <Checkbox
          disabled={disabled}
          edge="end"
          onChange={() => handleAssignLabel(label)}
          checked={checked}
        />
      </ListItemIcon>
      <ListItemButton
        sx={{
          bgcolor: label.color,
          borderRadius: 2,
          height: 30,
          "&:hover": {
            bgcolor: label.color,
            opacity: 0.9,
          },
        }}
        disabled={disabled}
        onClick={() => handleAssignLabel(label)}
      >
        <ListItemText
          sx={{
            maxWidth: 150,
            color: isDarkBackground ? "#ffffff" : "#000000",
            "& span": {
              overflow: "hidden",
              textOverflow: "ellipsis",
            },
          }}
        >
          {label.title}
        </ListItemText>
      </ListItemButton>
      <IconButton
        sx={{ ml: 1 }}
        aria-label="edit"
        onClick={() => {
          setSearchParams({ labelId: label._id });
          startEdit();
        }}
      >
        <EditIcon />
      </IconButton>
    </ListItem>
  );
};

export default LabelListItem;
