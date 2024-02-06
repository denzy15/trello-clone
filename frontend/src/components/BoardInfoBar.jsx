import { Box, Stack, Typography } from "@mui/material";
import React from "react";

const BoardInfoBar = (props) => {
  return (
    <Stack
      direction={"row"}
      sx={{
        bgcolor: "rgba(0, 0, 0, 0.1)",
        p: 2,
        borderBottom: "1px solid #b7b7b7",
      }}
    >
      <Typography variant="h5">{props.title}</Typography>
    </Stack>
  );
};

export default BoardInfoBar;
