import {
  Alert,
  Box,
  Container,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useDispatch, useSelector } from "react-redux";
import axiosInstance from "../axiosInterceptor";
import { SERVER_URL } from "../constants";
import { quitBoard, setBoards } from "../store/slices/boardsSlice";
import { useNavigate } from "react-router-dom";
import NewBoardModal from "../components/NewBoardModal";
import { setInvitations } from "../store/slices/invitationsSlice";
import { setMyRoleOnCurrentBoard } from "../store/slices/metadataSlice";
import { ViewKanbanOutlined } from "@mui/icons-material";
import { getTheme } from "../theme";
import HomePageSkeleton from "../components/skeletons/HomePageSkeleton";

const Home = () => {
  const { boards } = useSelector((state) => state.boards); // Получает список досок из глобального состояния
  const { mode } = useSelector((state) => state.theme); // Получает текущий режим темы из глобального состояния

  const [loading, setLoading] = useState(false); // Устанавливает состояние загрузки

  const theme = getTheme(mode); // Определяет тему для компонентов MUI на основе текущего режима

  const dispatch = useDispatch(); // Получает функцию dispatch для отправки действий в хранилище

  const [fetchError, setFetchError] = useState(""); // Устанавливает состояние ошибки при загрузке данных
  const [isNewBoardCreating, setIsNewBoardCreating] = useState(false); // Устанавливает состояние создания новой доски

  const navigate = useNavigate(); // Получает функцию для навигации между страницами

  useEffect(() => {
    // Загрузка уведомлений и досок при монтировании компонента
    async function fetchNotifications() {
      await axiosInstance
        .get(`${SERVER_URL}/api/invite`)
        .then(({ data }) => {
          dispatch(setInvitations(data)); // Обновляет список уведомлений в хранилище
        })
        .catch(() => setFetchError("Не удалось загрузить новые уведомления")); // Устанавливает сообщение об ошибке
    }

    async function fetchBoards() {
      setLoading(true); // Устанавливает состояние загрузки перед отправкой запроса
      await axiosInstance
        .get(`${SERVER_URL}/api/boards`)
        .then(({ data }) => {
          dispatch(setBoards(data)); // Обновляет список досок в хранилище
        })
        .catch(() => setFetchError("Не удалось загрузить доски")) // Устанавливает сообщение об ошибке
        .finally(() => {
          setLoading(false); // Сбрасывает состояние загрузки после завершения запроса
        });
    }

    fetchBoards(); // Вызывает функцию для загрузки досок
    fetchNotifications(); // Вызывает функцию для загрузки уведомлений
  }, [dispatch]); // Зависимость useEffect зависит от dispatch для обновления данных в хранилище

  useEffect(() => {
    // Сброс текущей доски и роли пользователя при изменении компонента
    dispatch(setMyRoleOnCurrentBoard(null)); // Сбрасывает роль пользователя на текущей доске
    dispatch(quitBoard()); // Сбрасывает текущую доску
  }, [dispatch]); // Зависимость useEffect зависит от dispatch для обновления данных в хранилище

  return (
    <Box>
      <Navbar />
      <Container>
        {!!fetchError && <Alert severity="error">{fetchError}</Alert>}
        <Box>
          <Stack
            direction={"row"}
            spacing={1}
            alignItems={"center"}
            sx={{ my: 2 }}
          >
            <ViewKanbanOutlined />
            <Typography variant="h6">Ваши рабочие пространства:</Typography>
          </Stack>
          {loading ? (
            <HomePageSkeleton />
          ) : (
            <Grid container spacing={2}>
              {boards.map((board, idx) => (
                <Grid
                  key={idx}
                  item
                  xs={6}
                  md={2}
                  onClick={() => navigate(`boards/${board._id}`)}
                >
                  <Paper
                    elevation={4}
                    sx={{
                      cursor: "pointer",
                      p: 2,
                      pb: 6,
                      color: "white",
                      background: `linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.5)), url(${SERVER_URL}/${board.currentBackground})`,
                      backgroundRepeat: "no-repeat",
                      backgroundSize: "cover",
                      fontFamily: "Montserrat, sans-serif",
                      fontWeight: 600,
                      lineHeight: 1.2,
                    }}
                  >
                    {board.title}
                  </Paper>
                </Grid>
              ))}
              <Grid item xs={6} md={2} sx={{ position: "relative" }}>
                <Paper
                  elevation={1}
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    cursor: "pointer",
                    p: 1,
                    minHeight: 80,
                    bgcolor: theme.palette.action.disabled,
                    fontFamily: "Montserrat, sans-serif",
                    fontWeight: 600,
                    lineHeight: 1.2,
                    transition: "0.3s",
                    position: "relative",
                    "&:hover": {
                      opacity: 0.8,
                    },
                  }}
                  onClick={() => setIsNewBoardCreating((v) => !v)}
                >
                  <Typography sx={{ fontWeight: 500, fontSize: 16 }}>
                    Создать доску
                  </Typography>
                </Paper>
                {isNewBoardCreating && (
                  <NewBoardModal
                    key={boards.length}
                    close={() => setIsNewBoardCreating(false)}
                  />
                )}
              </Grid>
            </Grid>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default Home;
