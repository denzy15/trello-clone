import {
  Box,
  Button,
  Container,
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
  const { username, email, _id } = useSelector((state) => state.auth); // Получает данные пользователя из глобального состояния

  const [editingUsername, setEditingUsername] = useState(false); // Состояние редактирования имени пользователя

  const [newUsername, setNewUsername] = useState(username); // Состояние нового имени пользователя

  const [changingPassword, setChangingPassword] = useState(false); // Состояние изменения пароля

  const [passwordData, setPasswordData] = useState(passwordEditData); // Состояние данных пароля

  const [showOldPassword, setShowOldPassword] = useState(false); // Состояние отображения старого пароля
  const [showNewPassword, setShowNewPassword] = useState(false); // Состояние отображения нового пароля
  const [showNewPasswordConfirm, setShowNewPasswordConfirm] = useState(false); // Состояние отображения подтверждения нового пароля

  const handleChangePassword = (event) => {
    // Обработчик изменений в полях пароля
    setPasswordData((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const validatePasswordData = () => {
    // Проверка введенных данных пароля
    if (
      !passwordData.newPass ||
      !passwordData.newPassConfirm ||
      !passwordData.oldPass
    ) {
      toast.error("Необходимо заполнить все поля"); // Выводит сообщение об ошибке, если не все поля заполнены
      return false;
    }

    if (passwordData.newPass.length < 8) {
      toast.error("Новый пароль должен содержать не менее 8 символов"); // Выводит сообщение об ошибке, если длина нового пароля меньше 8 символов
      return false;
    }

    if (passwordData.newPass !== passwordData.newPassConfirm) {
      toast.error("Пароли не совпадают"); // Выводит сообщение об ошибке, если новый пароль и его подтверждение не совпадают
      return false;
    }

    return true;
  };

  const fetchNewPassword = async () => {
    // Функция для отправки запроса на изменение пароля
    if (!validatePasswordData()) return; // Проверяет валидность данных пароля

    try {
      await axiosInstance.put(`${SERVER_URL}/api/users/${_id}`, {
        password: passwordData.oldPass,
        newPassword: passwordData.newPass,
      }); // Отправляет запрос на сервер для изменения пароля

      setChangingPassword(false); // Сбрасывает состояние изменения пароля
      setPasswordData(passwordEditData); // Сбрасывает состояние данных пароля
      setShowNewPassword(false); // Скрывает поле ввода нового пароля
      setShowNewPasswordConfirm(false); // Скрывает поле ввода подтверждения нового пароля
      setShowOldPassword(false); // Скрывает поле ввода старого пароля
      toast.success("Пароль успешно изменён"); // Выводит сообщение об успешном изменении пароля
    } catch (e) {
      toast.error(e.response.data.message || "Не удалось изменить пароль"); // Выводит сообщение об ошибке изменения пароля
    }
  };

  const dispatch = useDispatch(); // Получает функцию dispatch для отправки действий в хранилище

  const { mode } = useSelector((state) => state.theme); // Получает текущий режим темы из глобального состояния

  const theme = getTheme(mode); // Определяет тему для компонентов MUI на основе текущего режима

  const handleSaveNewUsername = async (e) => {
    // Обработчик сохранения нового имени пользователя
    if (e.type === "keydown" && e.key !== "Enter") return; // Если нажата клавиша не "Enter", завершает выполнение

    if (!newUsername || newUsername === username) {
      setNewUsername(username); // Возвращает предыдущее имя пользователя, если новое пустое или равно текущему
      setEditingUsername(false); // Завершает редактирование имени пользователя
      return;
    }

    try {
      await axiosInstance.put(`${SERVER_URL}/api/users/${_id}`, {
        username: newUsername,
      }); // Отправляет запрос на сервер для изменения имени пользователя
      dispatch(changeUsername(newUsername)); // Отправляет действие для изменения имени пользователя в хранилище
    } catch (e) {
      setNewUsername(username); // Возвращает предыдущее имя пользователя в случае ошибки
      toast.error(e.response.data.message || "Не удалось изменить имя"); // Выводит сообщение об ошибке изменения имени пользователя
    }

    setEditingUsername(false); // Завершает редактирование имени пользователя
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
                    bgcolor: theme.palette.action.disabledBackground,
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
