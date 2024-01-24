import React from "react";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import {
  Box,
  Button,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { signOut } from "../store/slices/authSlice";

const Navbar = () => {
  const dispatch = useDispatch();
  const userInfo = useSelector((state) => state.auth);
  return (
    <Box
      direction={"row"}
      component={Stack}
      spacing={1}
      sx={{
        borderBottom: "1px solid gray",
        p: 2,
        alignItems: "center",
      }}
    >
      <Link
        style={{
          fontSize: 18,
          fontFamily: "Montserrat",
          display: "flex",
          alignItems: "center",
          gap: 10,
          color: "gray",
          flexGrow: 1,
        }}
        to="/"
      >
        <AccountTreeIcon />
        <span>Trello Clone</span>
      </Link>
      <TextField label="Поиск..." type="search" variant="standard" />
      <Box
        component={Stack}
        direction={"row"}
        spacing={2}
        sx={{ alignItems: "center" }}
      >
        <Typography variant="subtitle1">
          {userInfo.username} | {userInfo.email}
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => {
            dispatch(signOut());
          }}
        >
          Выйти
        </Button>
      </Box>
    </Box>
  );
};

export default Navbar;
