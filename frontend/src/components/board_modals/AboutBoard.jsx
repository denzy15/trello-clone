import { Avatar, Box, Divider, Stack, Typography } from "@mui/material";
import React from "react";
import { useSelector } from "react-redux";
import { convertUsernameForAvatar, getUserColor } from "../../utils";
import DraftEditor from "../draft_editor/DraftEditor";

const AboutBoard = () => {
  const { currentBoard } = useSelector((state) => state.boards);

  const boardAdmins = [];

  boardAdmins.push(currentBoard.creator);

  for (const u of currentBoard.users) {
    if (u.role === "ADMIN") {
      boardAdmins.push(u.userId);
    }
  }

  return (
    <Box sx={{ p: 2 }}>
      <Box>
        <Typography sx={{ fontWeight: 500, fontSize: 16, mb: 1 }}>
          Администраторы:
        </Typography>
        <Stack direction={"column"} spacing={1.5}>
          {boardAdmins.map((adm) => (
            <React.Fragment key={adm._id}>
              <Stack direction={"row"} spacing={1}>
                <Avatar sx={{ bgcolor: getUserColor(adm._id) }}>
                  {convertUsernameForAvatar(adm.username)}
                </Avatar>
                <Box>
                  <Typography sx={{ fontWeight: 500 }}>
                    {adm.username}
                  </Typography>
                  <Typography variant="body2">{adm.email}</Typography>
                </Box>
              </Stack>
              <Divider flexItem />
            </React.Fragment>
          ))}
        </Stack>
      </Box>
      <Box sx={{ my: 2 }}>
        <Typography sx={{ fontWeight: 500, fontSize: 16, mb: 1 }}>
          Описание:
        </Typography>
        <DraftEditor />
      </Box>
    </Box>
  );
};

export default AboutBoard;
