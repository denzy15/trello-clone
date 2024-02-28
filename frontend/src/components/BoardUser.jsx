import {
  Avatar,
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import React from "react";
import { convertUsernameForAvatar, getUserColor } from "../utils";
import { useSelector } from "react-redux";

const BoardUser = ({ _id, username, email, role }) => {
  const currentUser = useSelector((state) => state.auth);

  const handleChange = (event) => {
    if (true) {
    }
    console.log(event.target.value);
  };

  return (
    <Stack alignItems={"center"} spacing={1.5} direction={"row"}>
      <Avatar sx={{ bgcolor: getUserColor(_id) }}>
        {convertUsernameForAvatar(username)}
      </Avatar>
      <Box>
        <Typography>{username}</Typography>
        <Typography variant="subtitle2">{email}</Typography>
      </Box>
      <FormControl fullWidth>
        <Select
          disabled={role !== "ADMIN"}
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={role}
          onChange={handleChange}
        >
          <MenuItem value={"ADMIN"}>Админ</MenuItem>
          <MenuItem value={"MEMBER"}>Участник</MenuItem>
          <MenuItem value={"delete"} disabled={currentUser._id === _id}>
            Удалить
          </MenuItem>
        </Select>
      </FormControl>
    </Stack>
  );
};

export default BoardUser;
