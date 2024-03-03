import { Delete, ExitToApp, Group, Info, PersonAdd } from "@mui/icons-material";
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import React from "react";
import { useSelector } from "react-redux";

const MainBoardModal = ({ handleClick }) => {
  const { _id } = useSelector((state) => state.auth);
  const { currentBoard } = useSelector((state) => state.boards);
  // console.log(currentBoard);

  const items = [
    { id: 1, text: "О доске", icon: <Info /> },
    { id: 2, text: "Участники", icon: <Group /> },
    { id: 3, text: "Покинуть доску", icon: <ExitToApp /> },
    { id: 4, text: "Удалить доску", icon: <Delete />, disabled: true },
  ];

  return (
    <List>
      {items.map((item) => (
        <ListItem key={item.id}>
          <ListItemButton
            disabled={item.disabled}
            onClick={() => handleClick(item.id)}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
};

export default MainBoardModal;
