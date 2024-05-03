import {
  Box,
  Button,
  Container,
  FormControl,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import Navbar from "../components/Navbar";
import { useDispatch, useSelector } from "react-redux";
import axiosInstance from "../axiosInterceptor";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { SERVER_URL } from "../constants";
import { toast } from "react-toastify";
import { changeUsername } from "../store/slices/authSlice";
import { getTheme } from "../theme";

const passwordEditData = {
  oldPass: "",
  newPass: "",
  newPassConfirm: "",
};

const Profile = () => {
  const { username, email, _id } = useSelector((state) => state.auth);

  const [editingUsername, setEditingUsername] = useState(false);

  const [newUsername, setNewUsername] = useState(username);

  const [changingPassword, setChangingPassword] = useState(false);

  const [passwordData, setPasswordData] = useState(passwordEditData);

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showNewPasswordConfirm, setShowNewPasswordConfirm] = useState(false);

  const handleChangePassword = (event) => {
    setPasswordData((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const validatePasswordData = () => {
    if (
      !passwordData.newPass ||
      !passwordData.newPassConfirm ||
      !passwordData.oldPass
    ) {
      toast.error("Необходимо заполнить все поля");
      return false;
    }

    // if (passwordData.newPass.length < 8) {
    //   toast.error("Новый пароль должен содержать не менее 8 символов");
    //   return false;
    // }

    if (passwordData.newPass !== passwordData.newPassConfirm) {
      toast.error("Пароли не совпадают");
      return false;
    }

    return true;
  };

  const fetchNewPassword = async () => {
    if (!validatePasswordData()) return;

    try {
      await axiosInstance.put(`${SERVER_URL}/api/users/${_id}`, {
        password: passwordData.oldPass,
        newPassword: passwordData.newPass,
      });

      setChangingPassword(false);
      setPasswordData(passwordEditData);
      setShowNewPassword(false);
      setShowNewPasswordConfirm(false);
      setShowOldPassword(false);
      toast.success("Пароль успешно изменён");
    } catch (e) {
      toast.error(e.response.data.message || "Не удалось изменить пароль");
    }
  };

  const dispatch = useDispatch();

  const {mode} = useSelector(state=>state.theme)

  const theme = getTheme(mode)


  const handleSaveNewUsername = async (e) => {
    if (e.type === "keydown" && e.key !== "Enter") return;

    if (!newUsername || newUsername === username) {
      setNewUsername(username);
      setEditingUsername(false);
      return;
    }

    try {
      await axiosInstance.put(`${SERVER_URL}/api/users/${_id}`, {
        username: newUsername,
      });
      dispatch(changeUsername(newUsername));
    } catch (e) {
      setNewUsername(username);
      toast.error(e.response.data.message || "Не удалось изменить имя");
    }

    setEditingUsername(false);
  };

  return (
    <Box>
      <Navbar />
      <Container maxWidth="sm">
        <Typography
          variant="h4"
          sx={{
            my: 2,
          }}
        >
          Информация профиля
        </Typography>
        <Paper sx={{ p: 2 }}>
          <Box sx={{ mb: 1 }}>
            <Typography variant="subtitle2">Имя пользователя:</Typography>
            {editingUsername ? (
              <TextField
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                size="small"
                onBlur={handleSaveNewUsername}
                onKeyDown={handleSaveNewUsername}
              />
            ) : (
              <Typography
                sx={{
                  display: "inline-block",
                  p: 0.5,
                  borderRadius: 1,
                  transition: "0.3s",
                  "&:hover": {
                    bgcolor: theme.palette.action.disabledBackground
                  },
                }}
                onClick={() => setEditingUsername(true)}
              >
                {newUsername}
              </Typography>
            )}
          </Box>
          <Box>
            <Typography variant="subtitle2">Почта:</Typography>
            <Typography variant="subtitle2">{email}</Typography>
          </Box>
          <Box sx={{ mt: 2 }}>
            {changingPassword ? (
              <Box>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Изменение пароля
                </Typography>
                <TextField
                  type={showOldPassword ? "text" : "password"}
                  fullWidth
                  sx={{ mb: 1 }}
                  label="Старый пароль"
                  name="oldPass"
                  value={passwordData.oldPass}
                  onChange={handleChangePassword}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowOldPassword((show) => !show)}
                          onMouseDown={() =>
                            setShowOldPassword((show) => !show)
                          }
                        >
                          {showOldPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  sx={{ mb: 1 }}
                  fullWidth
                  label="Новый пароль"
                  type={showNewPassword ? "text" : "password"}
                  name="newPass"
                  value={passwordData.newPass}
                  onChange={handleChangePassword}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowNewPassword((show) => !show)}
                          onMouseDown={() =>
                            setShowNewPassword((show) => !show)
                          }
                        >
                          {showNewPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  type={showNewPasswordConfirm ? "text" : "password"}
                  label="Повторите новый пароль"
                  fullWidth
                  name="newPassConfirm"
                  value={passwordData.newPassConfirm}
                  onChange={handleChangePassword}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() =>
                            setShowNewPasswordConfirm((show) => !show)
                          }
                          onMouseDown={() =>
                            setShowNewPasswordConfirm((show) => !show)
                          }
                        >
                          {showNewPasswordConfirm ? (
                            <VisibilityOff />
                          ) : (
                            <Visibility />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <Stack direction={"row"} spacing={1} sx={{ mt: 2 }}>
                  <Button variant="contained" onClick={fetchNewPassword}>
                    Изменить
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setChangingPassword(false);
                      setPasswordData(passwordEditData);
                    }}
                  >
                    Отмена
                  </Button>
                </Stack>
              </Box>
            ) : (
              <Button
                variant="outlined"
                onClick={() => setChangingPassword(true)}
              >
                Изменить пароль
              </Button>
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Profile;
