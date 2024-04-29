import {
  Box,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import React from "react";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ViewKanbanIcon from "@mui/icons-material/ViewKanban";
import ListAltIcon from "@mui/icons-material/ListAlt";
import { useNavigate } from "react-router-dom";

const icons = {
  card: <AssignmentIcon />,
  board: <ViewKanbanIcon />,
  list: <ListAltIcon />,
};

const SearchResultItem = (props) => {
  const { type, _id, title, boardId, boardTitle, handleClickAway } = props;

  const navigate = useNavigate();

  const secondaryText =
    type === "board" ? "Рабочее пространство" : "доска " + boardTitle;

  const handleClick = () => {
    navigate(`/boards/${type === "board" ? _id : boardId}`);
    handleClickAway()
  };

  return (
    <ListItem disablePadding>
      <ListItemButton onClick={handleClick} disableGutters sx={{ pl: 1 }}>
        <ListItemIcon>{icons[type]}</ListItemIcon>
        <ListItemText primary={title} secondary={secondaryText} />
      </ListItemButton>
    </ListItem>
  );
};

export default SearchResultItem;
