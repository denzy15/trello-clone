import {
  Avatar,
  Box,
  FormControl,
  InputLabel,
  List,
  ListItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import axiosInstance from "../../axiosInterceptor";
import { SERVER_URL } from "../../constants";
import GridLoader from "react-spinners/GridLoader";
import UserSearchResultItem from "../UserSearchResultItem";
import { useSelector } from "react-redux";
import { convertUsernameForAvatar, getUserColor } from "../../utils";
import BoardUser from "../BoardUser";

const AddUser = () => {
  const [searchModal, setSearchModal] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  const [loading, setLoading] = useState(false);

  const [searchResults, setSearchResults] = useState([]);

  const { currentBoard } = useSelector((state) => state.boards);

  const modalRef = useRef();

  useEffect(() => {
    if (searchQuery === "") {
      setSearchModal(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      setSearchModal(true);
      try {
        const { data } = await axiosInstance.get(
          `${SERVER_URL}/api/users?search=${searchQuery}`
        );
        setSearchResults(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }, 1000);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setSearchModal(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <Box sx={{ p: 1 }}>
      <Typography>Пригласить пользователей:</Typography>
      <TextField
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Поиск..."
        type="search"
        sx={{ my: 1 }}
        fullWidth
        autoComplete="off"
      />
      <Paper
        ref={modalRef}
        sx={{ position: "absolute", width: "90%", zIndex: 10 }}
        hidden={!searchModal}
        onClick={() => setSearchModal(false)}
      >
        {loading ? (
          <Box sx={{ textAlign: "center", my: 2 }}>
            <GridLoader color="#875ceb" size={10} />
          </Box>
        ) : searchResults.length > 0 ? (
          <List onClick={(e) => e.stopPropagation()}>
            {searchResults.map((u) => (
              <UserSearchResultItem key={u._id} {...u} />
            ))}
          </List>
        ) : (
          <Box sx={{ p: 2 }}>
            <Typography>Ничего не найдено</Typography>
          </Box>
        )}
      </Paper>
      <Typography sx={{ mt: 3 }}>Пользователи доски:</Typography>
      <Box>
        <Box>
          <BoardUser {...currentBoard.creator} role={"ADMIN"} />
          {currentBoard.users.map((u) => {
            const { role, userId } = u;
            return <BoardUser key={u._id} role={role} {...userId} />;
          })}
        </Box>
      </Box>
    </Box>
  );
};

export default AddUser;
