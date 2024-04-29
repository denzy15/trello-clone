import { Route, Routes, useParams } from "react-router-dom";
import "./App.css";
import { Box, CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import Home from "./pages/Home";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import BoardPage from "./pages/BoardPage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "draft-js/dist/Draft.css";
import dayjs from "dayjs";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import { useEffect } from "react";
import { SERVER_URL } from "./constants";
import { useDispatch, useSelector } from "react-redux";
import {
  setInvitations,
  setNewInvitation,
} from "./store/slices/invitationsSlice";
import { getTheme } from "./theme";

function App() {
  dayjs.locale("ru");

  const dispatch = useDispatch();

  const { _id } = useSelector((state) => state.auth);

  const mode = useSelector((state) => state.theme.mode);

  const theme = getTheme(mode);

  useEffect(() => {
    const eventSource = new EventSource(`${SERVER_URL}/sse`);
    eventSource.onmessage = function (event) {
      const newInvitation = JSON.parse(event.data);
      if (_id === newInvitation.invitedUser) {
        dispatch(setNewInvitation(newInvitation));
      }
    };
    return () => {
      eventSource.close();
    };
  }, [_id, dispatch]);

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
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </Box>
    </ThemeProvider>
  );
}

export default App;
