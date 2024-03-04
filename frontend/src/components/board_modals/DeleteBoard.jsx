import { Box, Button, Typography } from "@mui/material";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../axiosInterceptor";
import { SERVER_URL } from "../../constants";
import { toast } from "react-toastify";

const DeleteBoard = () => {
  const { boardId } = useParams();

  const navigate = useNavigate();

  const handleDeleteBoard = async () => {
    await axiosInstance
      .delete(`${SERVER_URL}/api/boards/${boardId}`)
      .then(() => {
        navigate("/");
      })
      .catch((e) => {
        toast.error(e.response.data.message || "Не удалось удалить доску");
      });
  };

  return (
    <Box sx={{ p: 2, maxWidth: 300 }}>
      <Typography
        sx={{
          mb: 2,
          "&>span": {
            fontWeight: 600,
            textTransform: "uppercase",
          },
        }}
      >
        Вы уверены что хотите удалить доску? Все списки, карточки и участники
        будут удалены. <span>Это действие необратимо.</span>
      </Typography>
      <Button onClick={handleDeleteBoard} variant="contained" color="error">
        Удалить
      </Button>
    </Box>
  );
};

export default DeleteBoard;
