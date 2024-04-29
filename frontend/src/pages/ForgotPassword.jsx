import React, { useState } from "react";
import {
  Button,
  TextField,
  Container,
  Typography,
  Box,
  Paper,
} from "@mui/material";
import axiosInstance from "../axiosInterceptor";
import { SERVER_URL } from "../constants";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [sended, setSended] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSended(true);
    await axiosInstance
      .post(`${SERVER_URL}/api/auth/forgotPassword`, {
        email,
      })
      .then(() => {
        toast.success(
          "На ваш email отправлена ссылка для восстановления пароля"
        );
      })
      .catch((e) => {
        toast.error(
          e.response.data.message ||
            "Произошла ошибка при восстановлении пароля"
        );
        setSended(false);
      });
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
          <Button
            disabled={sended}
            type="submit"
            variant="contained"
            color="secondary"
          >
            Восстановить
          </Button>
        </form>
        <Typography
          sx={{
            mt: 2,
            display: sended ? "block" : "none",
          }}
        >
          <Link to="/login">Вернуться на страницу входа</Link>
        </Typography>
      </Paper>
    </Box>
  );
};

export default ForgotPassword;
