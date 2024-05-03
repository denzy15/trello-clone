import {
  Box,
  Button,
  Grid,
  IconButton,
  Paper,
  Popover,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { SERVER_URL } from "../constants";
import { Delete } from "@mui/icons-material";

const BackgroundItem = ({ bg, handlePickBg, handleDeleteBg }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleOpenPopover = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClosePopover = (event) => {
    event.stopPropagation();
    setAnchorEl(null);
  };

  return (
    <Grid
      item
      xs={12}
      md={6}
      sx={{
        cursor: "pointer",
        position: "relative",
        "&:hover .delete-icon": {
          opacity: 1,
          visibility: "visible",
        },
      }}
      onClick={() => handlePickBg(bg.path)}
    >
      <Paper
        sx={{
          height: 80,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <img
          src={`${SERVER_URL}/${bg.path}`}
          alt={bg.name}
          style={{ width: "100%", height: "100%" }}
        />
        {!!bg._id && (
          <IconButton
            onClick={handleOpenPopover}
            sx={{
              position: "absolute",
              bottom: 0,
              right: 0,
              opacity: 0,
              visibility: "hidden",
              bgcolor: "rgba(0,0,0,0.5)",
              color: "white",
              transition: "opacity 0.3s ease",
              "&:hover": {
                bgcolor: "rgba(0,0,0,0.7)",
                opacity: 1,
                visibility: "visible",
              },
            }}
            className="delete-icon"
          >
            <Delete color="inherit" />
          </IconButton>
        )}
        <Popover
          open={!!anchorEl}
          anchorEl={anchorEl}
          onClose={handleClosePopover}
          anchorOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
          transformOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <Box sx={{ p: 2, maxWidth: { md: "25vw" } }}>
            <Typography sx={{ mb: 1 }}>
              Удаление фона необратимо. Отмена невозможна.
            </Typography>
            <Button
              variant="contained"
              color="error"
              fullWidth
              onClick={() => handleDeleteBg(bg)}
            >
              Удалить
            </Button>
          </Box>
        </Popover>
      </Paper>
    </Grid>
  );
};

export default BackgroundItem;
