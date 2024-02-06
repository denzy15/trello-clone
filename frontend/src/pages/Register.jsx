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
import { useDispatch } from "react-redux";
import { login } from "../store/slices/authSlice";

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
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleClickShowConfirmPassword = () =>
    setShowConfirmPassword((show) => !show);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState(initialErrorsData);

  const handleLogin = () => {
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
      .post("http://localhost:5000/api/auth/register", rest)
      .then(() => {
        axios
          .post("http://localhost:5000/api/auth/login", {
            email: formData.email,
            password: formData.password,
          })
          .then(({ data }) => {
            dispatch(login(data));
            navigate("/");
            setFormData(initialFormData);
            setErrors(initialErrorsData);
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
        setErrors((prev) => ({ ...prev, common: "Ошибка сервера" }));
      });
  };

  const handleChange = (event) => {
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
        pt: "10%",
        mx: "auto",
      }}
    >
      <Paper elevation={3} sx={{ px: 5, py: 7 }}>
        <Box
          component={Stack}
          direction={"row"}
          justifyContent={"space-between"}
        >
          <Typography sx={{ fontWeight: 600, fontSize: 18 }}>
            Trello Clone
          </Typography>
          <Typography
            sx={{
              "& a": {
                color: "#6534d9",
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
            }}
          >
            <img
              src="https://kartinki.pibig.info/uploads/posts/2023-04/1680919882_kartinki-pibig-info-p-lyudi-kartinki-dlya-prezentatsii-arti-3.jpg"
              alt="hey!"
            />
          </Box>
          <Box sx={{ flexBasis: "50%" }}>
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
