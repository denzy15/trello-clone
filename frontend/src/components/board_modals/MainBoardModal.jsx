import { Delete, ExitToApp, Group, Info, Wallpaper } from "@mui/icons-material";
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
  const { role } = useSelector((state) => state.metadata);

  const items = [
    { id: 1, text: "О доске", icon: <Info /> },
    { id: 2, text: "Участники", icon: <Group /> },
    {
      id: 3,
      text: "Сменить фон",
      icon: <Wallpaper />,
      disabled: role !== "ADMIN",
    },
    {
      id: 4,
      text: "Покинуть доску",
      icon: <ExitToApp />,
      disabled: currentBoard.creator._id === _id,
    },
    {
      id: 5,
      text: "Удалить доску",
      icon: <Delete />,
      disabled: role !== "ADMIN",
    },
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
