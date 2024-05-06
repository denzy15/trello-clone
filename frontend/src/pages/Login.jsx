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
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../store/slices/authSlice";
import { SERVER_URL } from "../constants";
import { getTheme } from "../theme";

import lightThemeImage from "../assets/auth-image-2.jpg";

const initialFormData = {
  email: "",
  password: "",
};

const initialErrorsData = {
  email: "",
  password: "",
  common: "",
};

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const { mode } = useSelector((state) => state.theme);
  const theme = getTheme(mode);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState(initialErrorsData);

  const handleLogin = () => {
    if (!formData.email) {
      setErrors((prev) => ({ ...prev, email: "Заполните поле" }));
      return;
    }
    setErrors((prev) => ({ ...prev, email: "" }));

    if (!formData.password) {
      setErrors((prev) => ({ ...prev, password: "Заполните поле" }));
      return;
    }
    setErrors((prev) => ({ ...prev, password: "" }));

    axios
      .post(`${SERVER_URL}/api/auth/login`, formData)
      .then(({ data }) => {
        dispatch(login(data));
        navigate("/");
        setFormData(initialFormData);
        setErrors(initialErrorsData);
      })
      .catch((e) => {
        console.log(e);
        setErrors((prev) => ({
          ...prev,
          common: e.response.data.message || "Неверный логин или пароль",
        }));
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
          sx={{ mb: 2 }}
          spacing={1}
        >
          <Typography sx={{ fontWeight: 600, fontSize: 18 }}>
            Trello Clone
          </Typography>
          <Typography
            sx={{
              "& a": {
                textDecoration: "underline",
                color: theme.palette.secondary.main,
              },
            }}
          >
            Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
          </Typography>
        </Box>

        <Box component={Stack} direction={"row"}>
          <Box
            sx={{
              flexBasis: "50%",
              "& img": {
                maxWidth: "100%",
              },
              display: {
                xs: "none",
                md: "block",
              },
            }}
          >
            <img src={lightThemeImage} alt="hey!" />
          </Box>
          <Box sx={{ flexBasis: { md: "50%", xs: '100%' } }}>
            <Typography variant="h4">С возвращением!</Typography>
            <Typography
              variant="subtitle1"
              sx={{
                mt: 1,
                mb: 2,
                color: "gray",
              }}
            >
              Войдите чтобы продолжить
            </Typography>
            <FormControl sx={{ width: "100%" }}>
              <TextField
                name="email"
                label="Email"
                sx={{ mb: 3 }}
                color="secondary"
                fullWidth
                error={!!errors.email}
                helperText={errors.email}
                autoComplete="off"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon />
                    </InputAdornment>
                  ),
                }}
                onChange={handleChange}
                value={formData.email}
              />
              <TextField
                label="Пароль"
                type={showPassword ? "text" : "password"}
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
              {!!errors.common && (
                <Alert sx={{ my: 2 }} severity="error">
                  {errors.common}
                </Alert>
              )}
              <Stack
                direction={"row"}
                spacing={2}
                alignItems={"center"}
                sx={{ mt: 5 }}
              >
                <Button
                  variant="contained"
                  color="secondary"
                  sx={{ maxWidth: 150 }}
                  onClick={handleLogin}
                >
                  Войти
                </Button>
                <Typography
                  sx={{
                    "& a": {
                      color: "#6534d9",
                    },
                  }}
                >
                  <Link to="/forgotPassword">Забыли пароль?</Link>
                </Typography>
              </Stack>
            </FormControl>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;
