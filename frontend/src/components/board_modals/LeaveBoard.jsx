import { Box, Button, Typography } from "@mui/material";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../axiosInterceptor";
import { SERVER_URL } from "../../constants";
import { toast } from "react-toastify";

const LeaveBoard = () => {
  const navigate = useNavigate();

  const { boardId } = useParams();

  const handleLeaveBoard = async () => {
    await axiosInstance
      .put(`${SERVER_URL}/api/boards/${boardId}/leave`)
      .then((_) => {
        navigate("/");
      }).catch(e=> {
        toast.error(e.response.data.message || "Что-то пошло не так")
      })
  };

  return (
    <Box sx={{ p: 2, maxWidth: 300 }}>
      <Typography sx={{ mb: 2 }}>
        Вы уверены что хотите покинуть доску? Вам потребуется приглашение если
        вы захотите вернуться на доску
      </Typography>
      <Button
        variant="contained"
        color="error"
        fullWidth
        onClick={handleLeaveBoard}
      >
        Покинуть
      </Button>
    </Box>
  );
};

export default LeaveBoard;
