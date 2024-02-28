import { List, ListItem, ListItemButton, ListItemText } from "@mui/material";
import React from "react";

const MainListModal = ({ handleClick }) => {
  const items = [
    { id: 1, text: "Копировать список" },
    { id: 2, text: "Переместить все карточки" },
    { id: 3, text: "Удалить список" },
  ];

  return (
    <List>
      {items.map((item, i) => (
        <ListItem key={i} alignItems="flex-start" disablePadding>
          <ListItemButton onClick={() => handleClick(item.id)}>
            <ListItemText primary={item.text} />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
};

export default MainListModal;
