import React, { useState } from "react";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Divider,
  FormControlLabel,
  IconButton,
  Popover,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { signOut } from "../store/slices/authSlice";
import {
  convertUsernameForAvatar,
  getContrastColor,
  getUserColor,
} from "../utils";
import { Notifications } from "@mui/icons-material";
import Invitation from "./Invitation";
import SearchBar from "./SearchBar";
import { toggleTheme } from "../store/slices/themeSlice";
import { getTheme } from "../theme";

const Navbar = () => {
  const dispatch = useDispatch();
  const userInfo = useSelector((state) => state.auth);
  const { invitations } = useSelector((state) => state.invitations);
  const { mode } = useSelector((state) => state.theme);

  const navigate = useNavigate();

  const [notifAnchorEl, setNotifAnchorEl] = useState(null);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);

  const getBadgeCount = () => {
    let counter = 0;
    for (const inv of invitations) {
      if (inv.status === "pending") counter++;
    }
    return counter;
  };

  const handleChangeTheme = () => {
    dispatch(toggleTheme());
  };

  const theme = getTheme(mode);

  return (
    <Box
      direction={"row"}
      component={Stack}
      spacing={1}
      sx={{
        borderBottom: "1px solid",
        borderColor: theme.palette.text.disabled,
        bgcolor: theme.palette.background.paper,
        p: 2,
        alignItems: "center",
      }}
    >
      <Typography sx={{ flexGrow: 1 }}>
        <Link
          style={{
            fontSize: 18,
            fontFamily: "Montserrat",
            display: "flex",
            alignItems: "center",
            gap: 10,
            color: "inherit",
          }}
          to="/"
        >
          <AccountTreeIcon />
          <Box
            component={"span"}
            sx={{
              display: {
                xs: "none",
                md: "inline",
              },
            }}
          >
            Trello Clone
          </Box>
        </Link>
      </Typography>
      <SearchBar />
      <Box
        component={Stack}
        direction={"row"}
        spacing={2}
        sx={{ alignItems: "center" }}
      >
        <IconButton onClick={(e) => setNotifAnchorEl(e.currentTarget)}>
          <Badge badgeContent={getBadgeCount()} color="secondary">
            <Notifications />
          </Badge>
        </IconButton>

        <Avatar
          sx={{
            cursor: "pointer",
            bgcolor: getUserColor(userInfo._id),
            border: `1px solid ${theme.palette.text.disabled}`,
            color: getContrastColor(getUserColor(userInfo._id)),
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
            <Stack
              direction={"column"}
              spacing={1.5}
              sx={{ mt: 2, overflow: "auto", maxWidth: 300, maxHeight: 400 }}
            >
              {invitations.length === 0 ? (
                <Box>
                  <Typography>Нет уведомлений</Typography>
                </Box>
              ) : (
                invitations.map((inv) => <Invitation key={inv._id} {...inv} />)
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
                  color: getContrastColor(getUserColor(userInfo._id)),
                }}
              >
                {convertUsernameForAvatar(userInfo.username)}
              </Avatar>
              <Typography>{userInfo.username}</Typography>
            </Stack>
            <FormControlLabel
              sx={{ my: 1 }}
              control={
                <Switch
                  checked={mode === "light"}
                  onChange={handleChangeTheme}
                  name="theme"
                  color="default"
                />
              }
              label={`${mode === "light" ? "Светлая" : "Темная"} тема`}
            />
            <Button
              onClick={() => navigate("/profile")}
              sx={{ justifyContent: "start" }}
              color="inherit"
              fullWidth
            >
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
