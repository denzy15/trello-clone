import { Route, Routes } from "react-router-dom";
import "./App.css";
import { Box, Container } from "@mui/material";
import Home from "./pages/Home";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { useSelector } from "react-redux";
import BoardPage from "./pages/BoardPage";

function App() {
  return (
    <Box className="App">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
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
      </Routes>
    </Box>
  );
}

export default App;
