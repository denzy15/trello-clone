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
import { useDispatch } from "react-redux";
import { login } from "../store/slices/authSlice";

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
  const [showPassword, setShowPassword] = React.useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

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
      .post("http://localhost:5000/api/auth/login", formData)
      .then(({ data }) => {
        dispatch(login(data));
        navigate("/");
        setFormData(initialFormData);
        setErrors(initialErrorsData);
      })
      .catch((e) => {
        console.log(e);
        setErrors((prev) => ({ ...prev, common: "Неверный логин или пароль" }));
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
            }}
          >
            <img
              src="https://kartinki.pibig.info/uploads/posts/2023-04/1680919882_kartinki-pibig-info-p-lyudi-kartinki-dlya-prezentatsii-arti-3.jpg"
              alt="hey!"
            />
          </Box>
          <Box sx={{ flexBasis: "50%" }}>
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
              <Button
                variant="contained"
                color="secondary"
                sx={{ maxWidth: 150, mt: 5 }}
                onClick={handleLogin}
              >
                Войти
              </Button>
            </FormControl>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;
