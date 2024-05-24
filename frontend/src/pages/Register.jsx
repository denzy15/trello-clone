import {
  Alert,
  Box,
  Button,
  FormControl,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import EmailIcon from "@mui/icons-material/Email";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../store/slices/authSlice";

import lightThemeImage from "../assets/auth-image-2.jpg";
import { getTheme } from "../theme";
import { APP_TITLE, SERVER_URL } from "../constants";
import { AccountTree } from "@mui/icons-material";

const initialFormData = {
  username: "",
  email: "",
  password: "",
  passwordConfirm: "",
};

const initialErrorsData = {
  username: "",
  email: "",
  password: "",
  passwordConfirm: "",
  common: "",
};

const Register = () => {
  const [showPassword, setShowPassword] = React.useState(false); // Состояние отображения пароля
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false); // Состояние отображения подтверждения пароля

  const handleClickShowPassword = () => setShowPassword((show) => !show); // Обработчик клика для отображения/скрытия пароля
  const handleClickShowConfirmPassword = () =>
    setShowConfirmPassword((show) => !show); // Обработчик клика для отображения/скрытия подтверждения пароля

  const dispatch = useDispatch(); // Получает функцию dispatch для отправки действий в хранилище
  const navigate = useNavigate(); // Получает функцию navigate для навигации по маршрутам

  const [formData, setFormData] = useState(initialFormData); // Состояние данных формы регистрации
  const [errors, setErrors] = useState(initialErrorsData); // Состояние ошибок валидации формы регистрации

  const { mode } = useSelector((state) => state.theme); // Получает текущий режим темы из глобального состояния
  const theme = getTheme(mode); // Определяет тему для компонентов MUI на основе текущего режима

  const handleLogin = () => {
    // Обработчик отправки формы регистрации
    if (!formData.username) {
      setErrors((prev) => ({ ...prev, username: "Заполните поле" }));
      return;
    }
    setErrors((prev) => ({ ...prev, username: "" }));

    if (!formData.email) {
      setErrors((prev) => ({ ...prev, email: "Заполните поле" }));
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setErrors((prev) => ({ ...prev, email: "Некорректный email" }));
      return;
    }

    setErrors((prev) => ({ ...prev, email: "" }));

    if (!formData.password) {
      setErrors((prev) => ({ ...prev, password: "Заполните поле" }));
      return;
    }
    setErrors((prev) => ({ ...prev, password: "" }));

    if (!formData.passwordConfirm) {
      setErrors((prev) => ({ ...prev, passwordConfirm: "Заполните поле" }));
      return;
    }

    if (formData.password !== formData.passwordConfirm) {
      setErrors((prev) => ({
        ...prev,
        passwordConfirm: "Пароли не совпадают",
      }));
      return;
    }

    setErrors((prev) => ({ ...prev, passwordConfirm: "" }));

    const { passwordConfirm, ...rest } = formData;

    axios
      .post(`${SERVER_URL}/api/auth/register`, rest) // Отправляет запрос на сервер для регистрации пользователя
      .then(() => {
        axios
          .post(`${SERVER_URL}/api/auth/login`, {
            email: formData.email,
            password: formData.password,
          }) // Отправляет запрос на сервер для входа после успешной регистрации
          .then(({ data }) => {
            dispatch(login(data)); // Отправляет действие для входа в хранилище
            navigate("/"); // Перенаправляет пользователя на главную страницу
            setFormData(initialFormData); // Сбрасывает данные формы
            setErrors(initialErrorsData); // Сбрасывает ошибки валидации формы
          })
          .catch((e) => {
            setErrors((prev) => ({
              ...prev,
              common:
                "Пользователь создан, но не удалось войти, ошибка сервера",
            }));
          });
      })
      .catch((e) => {
        setErrors((prev) => ({ ...prev, common: e.response.data.message || "Ошибка сервера" }));
      });
  };

  const handleChange = (event) => {
    // Обработчик изменений в полях формы
    setFormData((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
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
        <Box
          component={Stack}
          direction={{ md: "row" }}
          justifyContent={"space-between"}
        >
          <Typography
            sx={{
              flexGrow: 1,
              fontWeight: 600,
              fontSize: 18,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <AccountTree />
            <Box
              component={"span"}
              sx={{
                display: {
                  xs: "none",
                  md: "inline",
                },
              }}
            >
              {APP_TITLE}
            </Box>
          </Typography>
          <Typography
            sx={{
              "& a": {
                textDecoration: "underline",
                color: theme.palette.secondary.main,
              },
            }}
          >
            Есть аккаунт? <Link to="/login">Войти</Link>
          </Typography>
        </Box>

        <Box component={Stack} direction={"row"}>
          <Box
            sx={{
              flexBasis: "50%",
              alignSelf: "center",
              "& img": {
                maxWidth: "100%",
              },
              display: {
                xs: "none",
                md: "block",
              },
            }}
          >
            <img alt="hey!" src={lightThemeImage} />
          </Box>
          <Box sx={{ flexBasis: { md: "50%", xs: "100%" } }}>
            <Typography variant="h4">Добро пожаловать!</Typography>
            <Typography
              variant="subtitle1"
              sx={{
                mt: 1,
                mb: 2,
                color: "gray",
              }}
            >
              Зарегистрируйтесь чтобы продолжить
            </Typography>
            <FormControl sx={{ width: "100%" }}>
              <TextField
                label="Имя"
                name="username"
                sx={{ mb: 3 }}
                color="secondary"
                fullWidth
                error={!!errors.username}
                helperText={errors.username}
                autoComplete="off"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon />
                    </InputAdornment>
                  ),
                }}
                onChange={handleChange}
                value={formData.username}
              />
              <TextField
                label="Email"
                name="email"
                sx={{ mb: 3 }}
                color="secondary"
                fullWidth
                error={!!errors.email}
                helperText={errors.email}
                autoComplete="off"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon />
                    </InputAdornment>
                  ),
                }}
                onChange={handleChange}
                value={formData.email}
              />
              <TextField
                sx={{ mb: 3 }}
                type={showPassword ? "text" : "password"}
                label="Пароль"
                color="secondary"
                name="password"
                error={!!errors.password}
                helperText={errors.password}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                onChange={handleChange}
                value={formData.password}
              />
              <TextField
                type={showConfirmPassword ? "text" : "password"}
                label="Повторите пароль"
                color="secondary"
                name="passwordConfirm"
                error={!!errors.passwordConfirm}
                helperText={errors.passwordConfirm}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowConfirmPassword}
                        edge="end"
                      >
                        {showConfirmPassword ? (
                          <VisibilityOff />
                        ) : (
                          <Visibility />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                onChange={handleChange}
                value={formData.passwordConfirm}
              />
              {!!errors.common && (
                <Alert sx={{ my: 2 }} severity="error">
                  {errors.common}
                </Alert>
              )}
              <Button
                variant="contained"
                color="secondary"
                sx={{ maxWidth: 150, mt: 5 }}
                onClick={handleLogin}
              >
                Регистрация
              </Button>
            </FormControl>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Register;
