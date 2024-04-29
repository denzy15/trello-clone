import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Button,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import axiosInstance from "../axiosInterceptor";
import { SERVER_URL } from "../constants";
import { toast } from "react-toastify";
import { Link, useNavigate, useParams } from "react-router-dom";

const ResetPassword = () => {
  const [values, setValues] = useState({
    password: "",
    confirmPassword: "",
    showPassword: false,
    showConfirmPassword: false,
  });

  const { token } = useParams();

  const navigate = useNavigate();

  const [disabledButton, setDisabledButton] = useState(false);

  const handleChange = (prop) => (event) => {
    setValues({ ...values, [prop]: event.target.value });
  };

  const handleClickShowPassword = (prop) => () => {
    setValues({
      ...values,
      [prop]: !values[prop],
    });
  };

  const handleResetPassword = async () => {
    if (!values.password || !values.confirmPassword) {
      toast.error("Заполните все поля");
    } else if (values.password !== values.confirmPassword) {
      toast.error("Пароли не совпадают!");
    } else {
      setDisabledButton(true);
      await axiosInstance
        .post(`${SERVER_URL}/api/auth/reset/${token}`, {
          password: values.password,
        })
        .then(() => {
          toast.success("Пароль успешно изменён");
          navigate("/login");
        })
        .catch((e) => {
          setDisabledButton(false);
          if (
            e.response.data.message ===
            "Токен сброса пароля недействителен или истек"
          ) {
            toast.warn("Токен сброса пароля недействителен или истек");
            navigate("/forgotPassword");
          } else {
            toast.error(
              e.response.data.message || "Произошла ошибка при изменении пароля"
            );
          }
        });
    }
  };

  return (
    <Box
      sx={{
        maxWidth: {
          sm: "95vw",
          md: "50vw",
        },
        pt: "10%",
        mx: "auto",
      }}
    >
      <Paper elevation={3} sx={{ px: 5, py: 7 }}>
        <Typography component="h1" variant="h5">
          Новый пароль
        </Typography>
        <TextField
          tabIndex={1}
          variant="outlined"
          margin="normal"
          required
          fullWidth
          name="password"
          label="Пароль"
          type={values.showPassword ? "text" : "password"}
          id="password"
          autoComplete="current-password"
          value={values.password}
          onChange={handleChange("password")}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword("showPassword")}
                  edge="end"
                >
                  {values.showPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <TextField
          tabIndex={2}
          variant="outlined"
          margin="normal"
          required
          fullWidth
          name="confirmPassword"
          label="Подтвердите пароль"
          type={values.showConfirmPassword ? "text" : "password"}
          id="confirmPassword"
          autoComplete="current-password"
          value={values.confirmPassword}
          onChange={handleChange("confirmPassword")}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword("showConfirmPassword")}
                  edge="end"
                >
                  {values.showConfirmPassword ? (
                    <Visibility />
                  ) : (
                    <VisibilityOff />
                  )}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          onClick={handleResetPassword}
          disabled={disabledButton}
        >
          Сбросить пароль
        </Button>
        <Typography>
          <Link to="/login"></Link>
        </Typography>
      </Paper>
    </Box>
  );
};

export default ResetPassword;
