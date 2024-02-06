import {
  Alert,
  Avatar,
  Box,
  Checkbox,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axiosInstance from "../../axiosInterceptor";
import { SERVER_URL } from "../../constants";
import { toast } from "react-toastify";
import {
  addUserToCard,
  removeUserFromCard,
  startCardEdit,
  updateCardEditingInfo,
} from "../../store/slices/metadataSlice";
import { changeCardAssignedUsers } from "../../store/slices/boardsSlice";
import { convertUsernameForAvatar, getUserColor } from "../../utils";
import UserListItem from "../UserListItem";

const UserEdit = (props) => {
  const [userSearchValue, setUserSearchValue] = useState("");
  const [userSearchResult, setUserSearchResult] = useState([]);

  const { currentBoard } = useSelector((state) => state.boards);
  const { cardEditing } = useSelector((state) => state.metadata);

  const dispatch = useDispatch();

  const [fetchUserRequest, setFetchUserRequest] = useState({
    loading: false,
    userId: "",
  });

  useEffect(() => {
    dispatch(
      changeCardAssignedUsers({
        listIndex: cardEditing.card.listInfo.index,
        cardIndex: cardEditing.card.index,
        assignedUsers: cardEditing.card.assignedUsers,
      })
    );
  }, [cardEditing.card.assignedUsers.length]);

  const isAssigned = (userId) => {
    return cardEditing.card.assignedUsers.some((user) => user._id === userId);
  };

  const handleAssignUser = async (user) => {
    setFetchUserRequest({
      loading: true,
      userId: user._id,
    });
    try {
      const type = isAssigned(user._id) ? "remove" : "add";
      await axiosInstance.put(
        `${SERVER_URL}/api/cards/${currentBoard._id}/${cardEditing.card._id}/users`,
        { type, userId: user._id }
      );
      dispatch(
        type === "add" ? addUserToCard(user) : removeUserFromCard(user._id)
      );
    } catch (error) {
      toast.error("Не удалось изменить список пользователей");
    } finally {
      setFetchUserRequest({
        loading: false,
        userId: "",
      });
    }
  };

  const handleSearch = (event) => {
    const searchValue = event.target.value.toLowerCase();
    setUserSearchValue(searchValue);

    const filteredUsers = currentBoard.users.filter(
      (user) =>
        user.username.toLowerCase().includes(searchValue) ||
        user.email.toLowerCase().includes(searchValue)
    );

    if (
      currentBoard.creator.username.toLowerCase().includes(searchValue) ||
      currentBoard.creator.email.toLowerCase().includes(searchValue)
    ) {
      filteredUsers.push(currentBoard.creator);
    }

    setUserSearchResult(filteredUsers);
  };

  return (
    <Box sx={{ px: 2 }}>
      <TextField
        value={userSearchValue}
        onChange={handleSearch}
        label="Поиск участников"
        fullWidth
      />
      <Typography sx={{ fontWeight: 500, mt: 3 }}>Участники доски</Typography>
      <List>
        {!userSearchValue ? (
          <>
            <UserListItem
              checked={isAssigned(currentBoard.creator._id)}
              disabled={
                fetchUserRequest.userId === currentBoard.creator._id &&
                fetchUserRequest.loading
              }
              handleAssignUser={handleAssignUser}
              user={currentBoard.creator}
              key={currentBoard.creator._id}
            />
            {currentBoard.users.map((user, idx) => (
              <UserListItem
                checked={isAssigned(user._id)}
                disabled={
                  fetchUserRequest.userId === user._id &&
                  fetchUserRequest.loading
                }
                handleAssignUser={handleAssignUser}
                user={user}
                key={idx}
              />
            ))}
          </>
        ) : !userSearchResult.length ? (
          <Alert severity="info">Пользователь не найден</Alert>
        ) : (
          userSearchResult.map((user, idx) => (
            <UserListItem
              checked={isAssigned(user._id)}
              disabled={
                fetchUserRequest.userId === user._id && fetchUserRequest.loading
              }
              handleAssignUser={handleAssignUser}
              user={user}
              key={idx}
            />
          ))
        )}
      </List>
    </Box>
  );
};

export default UserEdit;
