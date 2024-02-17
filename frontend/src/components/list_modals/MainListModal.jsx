import { List, ListItem, ListItemButton, ListItemText } from "@mui/material";
import React from "react";

const MainListModal = ({ handleClick }) => {
  return (
    <List>
      <ListItem alignItems="flex-start" disablePadding>
        <ListItemButton onClick={() => handleClick(1)}>
          <ListItemText primary="Копировать список" />
        </ListItemButton>
      </ListItem>
      <ListItem alignItems="flex-start" disablePadding>
        <ListItemButton onClick={() => handleClick(2)}>
          <ListItemText primary="Переместить все карточки" />
        </ListItemButton>
      </ListItem>
      <ListItem alignItems="flex-start" disablePadding>
        <ListItemButton onClick={() => handleClick(3)}>
          <ListItemText primary="Удалить список" />
        </ListItemButton>
      </ListItem>
    </List>
  );
};

export default MainListModal;
