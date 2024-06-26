import React, { useState } from "react";
import {
  Button,
  TextField,
  Typography,
  Box,
  Paper,
  Stack,
} from "@mui/material";
import axiosInstance from "../axiosInterceptor";
import { SERVER_URL } from "../constants";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { getTheme } from "../theme";

const ForgotPassword = () => {
  const [email, setEmail] = useState(""); // Хранит значение email из поля ввода

  const [sended, setSended] = useState(false); // Устанавливает статус отправки формы восстановления пароля

  const { mode } = useSelector((state) => state.theme); // Получает текущий режим темы из глобального состояния
  const theme = getTheme(mode); // Определяет тему для компонентов MUI на основе текущего режима

  const handleSubmit = async (e) => {
    // Обработчик отправки формы
    e.preventDefault(); // Предотвращает стандартное поведение отправки формы и перезагрузку страницы
    setSended(true); // Устанавливает статус отправки формы в значение true

    try {
      // Попытка отправить запрос на сервер для восстановления пароля
      await axiosInstance.post(`${SERVER_URL}/api/auth/forgotPassword`, {
        email,
      });
      // Успешное выполнение запроса
      toast.success("На ваш email отправлена ссылка для восстановления пароля"); // Выводит уведомление об успешной отправке
    } catch (error) {
      // Обработка ошибки при отправке запроса
      toast.error(
        error.response.data.message ||
          "Произошла ошибка при восстановлении пароля"
      ); // Выводит уведомление об ошибке восстановления пароля
      setSended(false); // Возвращает статус отправки формы в исходное состояние (не отправлено)
    }
  };
  return (
    <Box
      sx={{
        maxWidth: {
          sm: "95vw",
          md: "70vw",
        },
        pt: { md: "10%" },
        mx: "auto",
        height: { xs: "100vh", md: "auto" },
      }}
    >
      <Paper
        elevation={3}
        sx={{ px: 5, py: 7, height: { xs: "100%", md: "auto" } }}
      >
        <Typography component="h1" variant="h5">
          Восстановление пароля
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="email"
            label="Ваш email"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Stack direction={"row"} alignItems={"center"} spacing={2}>
            <Button disabled={sended} type="submit" variant="contained">
              Восстановить
            </Button>
            <Typography
              sx={{
                mt: 2,
                "& > a": {
                  color: theme.palette.text.secondary,
                },
              }}
            >
              <Link to="/login">Вернуться на страницу входа</Link>
            </Typography>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
};

export default ForgotPassword;
