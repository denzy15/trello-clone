import { Alert, Box, Container, Grid, Paper, Stack, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import ScheduleIcon from "@mui/icons-material/Schedule";
import { useDispatch, useSelector } from "react-redux";
import axiosInstance from "../axiosInterceptor";
import { SERVER_URL } from "../constants";
import { setBoards } from "../store/slices/boardsSlice";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const { recent } = useSelector((state) => state.metadata);
  const { boards } = useSelector((state) => state.boards);
  const dispatch = useDispatch();

  const [fetchError, setFetchError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchBoards() {
      await axiosInstance
        .get(`${SERVER_URL}/api/boards`)
        .then(({ data }) => {
          dispatch(setBoards(data));
        })
        .catch(() => setFetchError("Не удалось загрузить доски"));
    }

    fetchBoards();
  }, [dispatch]);

  return (
    <Box>
      <Navbar />
      <Container>
        {!!fetchError && <Alert severity="error">{fetchError}</Alert>}
        {recent.length !== 0 && (
          <Box>
            <Typography
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                fontWeight: 600,
              }}
            >
              <ScheduleIcon />
              Недавно просмотренные:
            </Typography>
          </Box>
        )}
        <Box>
          <Typography variant="h6" sx={{ my: 3 }}>
            Ваши рабочие пространства:
          </Typography>
          <Grid container spacing={2}>
            {boards.map((board, idx) => (
              <Grid key={idx} item xs={2} onClick={() => navigate(`boards/${board._id}`)}>
                <Paper
                  elevation={1}
                  sx={{
                    cursor: "pointer",
                    p: 2,
                    pb: 6,
                    bgcolor: "#bce1bc",
                    fontFamily: "Montserrat, sans-serif",
                    fontWeight: 600,
                    lineHeight: 1.2,
                  }}
                >
                  {board.title}
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default Home;
