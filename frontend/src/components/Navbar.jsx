import React, { useState } from "react";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Divider,
  IconButton,
  Popover,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { signOut } from "../store/slices/authSlice";
import { convertUsernameForAvatar, getUserColor } from "../utils";
import { Notifications } from "@mui/icons-material";
import Notification from "./Notification";

const Navbar = () => {
  const dispatch = useDispatch();
  const userInfo = useSelector((state) => state.auth);
  const { invitations } = useSelector((state) => state.invitations);

  const [notifAnchorEl, setNotifAnchorEl] = useState(null);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);

  const getBadgeCount = () => {
    let counter = 0;
    for (const inv of invitations) {
      if (inv.status === "pending") counter++;
    }
    return counter;
  };

  return (
    <Box
      direction={"row"}
      component={Stack}
      spacing={1}
      sx={{
        borderBottom: "1px solid #b7b7b7",
        p: 2,
        alignItems: "center",
        bgcolor: "#87b1ff",
        color: "#252525",
      }}
    >
      <Link
        style={{
          fontSize: 18,
          fontFamily: "Montserrat",
          display: "flex",
          alignItems: "center",
          gap: 10,
          color: "#252525",
          flexGrow: 1,
        }}
        to="/"
      >
        <AccountTreeIcon />
        <span>Trello Clone</span>
      </Link>
      <TextField label="Поиск..." type="search" variant="standard" />
      <Box
        component={Stack}
        direction={"row"}
        spacing={2}
        sx={{ alignItems: "center" }}
      >
        <IconButton onClick={(e) => setNotifAnchorEl(e.currentTarget)}>
          <Badge badgeContent={getBadgeCount()} color="secondary">
            <Notifications sx={{ color: "white" }} />
          </Badge>
        </IconButton>

        <Avatar
          sx={{
            cursor: "pointer",
            bgcolor: getUserColor(userInfo._id),
            border: "1px solid #757575",
          }}
          onClick={(e) => setProfileAnchorEl(e.currentTarget)}
        >
          {convertUsernameForAvatar(userInfo.username)}
        </Avatar>

        <Popover
          open={!!notifAnchorEl}
          anchorEl={notifAnchorEl}
          onClose={() => setNotifAnchorEl(null)}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
        >
          <Box sx={{ p: 2 }}>
            <Typography sx={{ mb: 1 }}>УВЕДОМЛЕНИЯ</Typography>
            <Divider />
            <Stack direction={"column"} spacing={1.5} sx={{ mt: 2 }}>
              {invitations.length === 0 ? (
                <Box>
                  <Typography>Нет уведомлений</Typography>
                </Box>
              ) : (
                invitations.map((inv) => (
                  <Notification key={inv._id} {...inv} />
                ))
              )}
            </Stack>
          </Box>
        </Popover>

        <Popover
          open={!!profileAnchorEl}
          anchorEl={profileAnchorEl}
          onClose={() => setProfileAnchorEl(null)}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
        >
          <Box sx={{ p: 2 }}>
            <Typography sx={{ mb: 1 }}>УЧЕТНАЯ ЗАПИСЬ</Typography>
            <Divider />
            <Stack
              direction={"row"}
              alignItems={"center"}
              spacing={2}
              sx={{ my: 2 }}
            >
              <Avatar
                sx={{
                  bgcolor: getUserColor(userInfo._id),
                  border: "1px solid #757575",
                }}
              >
                {convertUsernameForAvatar(userInfo.username)}
              </Avatar>
              <Typography>{userInfo.username}</Typography>
            </Stack>
            <Button sx={{ justifyContent: "start" }} color="inherit" fullWidth>
              Настройки
            </Button>
            <Button
              sx={{ justifyContent: "start" }}
              color="inherit"
              fullWidth
              onClick={() => dispatch(signOut())}
            >
              Выйти
            </Button>
          </Box>
        </Popover>
      </Box>
    </Box>
  );
};

export default Navbar;
