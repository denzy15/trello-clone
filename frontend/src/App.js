import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import "./App.css";
import { Box, CssBaseline, ThemeProvider } from "@mui/material";
import Home from "./pages/Home";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import BoardPage from "./pages/BoardPage";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "draft-js/dist/Draft.css";
import dayjs from "dayjs";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import { useEffect } from "react";
import { SERVER_URL } from "./constants";
import { useDispatch, useSelector } from "react-redux";
import { setNewInvitation } from "./store/slices/invitationsSlice";
import { getTheme } from "./theme";
import { setTheme } from "./store/slices/themeSlice";
import {
  getKickedFromBoard,
  pickBoard,
  quitBoard,
} from "./store/slices/boardsSlice";

function App() {
  dayjs.locale("ru"); // Установка локали для библиотеки dayjs

  const dispatch = useDispatch(); 
  const { _id } = useSelector((state) => state.auth); 
  const { pathname } = useLocation(); // Получение текущего пути страницы
  const navigate = useNavigate(); // Получение функции навигации

  const mode = useSelector((state) => state.theme.mode); // Получение текущей темы из Redux
  const { currentBoard } = useSelector((state) => state.boards); // Получение текущей доски из Redux

  const theme = getTheme(mode); // Получение темы приложения

  useEffect(() => {
    // Обработчик для сброса текущей доски при переходе на другие страницы
    if (!pathname.startsWith("/boards")) {
      dispatch(quitBoard());
    }

    // Установка темы "light" при выходе из системы
    if (!_id) {
      dispatch(setTheme("light"));
    }

    return () => {}; // Очистка эффекта при размонтировании компонента
  }, [_id, dispatch, pathname]);


  useEffect(() => {
    // Подписка на события Server-Sent Events для обновления данных
    const eventSource = new EventSource(`${SERVER_URL}/sse`);

    if (!!_id) {
      eventSource.addEventListener("invitation", function (event) {
        const newInvitation = JSON.parse(event.data);
        if (_id === newInvitation.invitedUser) {
          dispatch(setNewInvitation(newInvitation));
        }
      });

      eventSource.addEventListener("kickUser", function (event) {
        const data = JSON.parse(event.data);
        if (data.userId === _id) {
          dispatch(getKickedFromBoard(data.boardId));
          toast.warn(`Вы были удалены с доски ${data.boardTitle}`);

          if (pathname === `/boards/${data.boardId}`) {
            navigate("/");
          }
        }
      });

      eventSource.addEventListener("boardUpdate", function (event) {
        const newBoardData = JSON.parse(event.data);
        if (
          !!currentBoard &&
          newBoardData.boardId === currentBoard._id &&
          newBoardData.initiator !== _id
        ) {
          dispatch(pickBoard(newBoardData.board));
        }
      });
    }

    return () => {
      eventSource.close();
    };
  }, [_id, currentBoard, currentBoard._id, dispatch, navigate, pathname]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgotPassword" element={<ForgotPassword />} />
          <Route path="/reset/:token" element={<ResetPassword />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/boards/:boardId"
            element={
              <ProtectedRoute>
                <BoardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
        </Routes>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          draggable
          pauseOnHover
          theme={mode === "light" ? "light" : "dark"}
        />
      </Box>
    </ThemeProvider>
  );
}

export default App;
