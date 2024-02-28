import {
  Box,
  Divider,
  IconButton,
  Popover,
  Stack,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import React, { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import MainListModal from "./list_modals/MainListModal";
import MoveCards from "./list_modals/MoveCards";
import DeleteList from "./list_modals/DeleteList";
import CopyList from "./list_modals/CopyList";

const steps = [
  {
    title: "Действия со списком",
    component: MainListModal,
  },
  { title: "Копировать список", component: CopyList },
  { title: "Переместить все карточки", component: MoveCards },
  {
    title: "Удалить список",
    component: DeleteList,
  },
];

const ListEditModal = (props) => {
  const { setAnchorEl, anchorEl } = props;

  const initialState = steps[0];

  const [modalState, setModalState] = useState(initialState);

  const handleClick = (index) => {
    setModalState(steps[index]);
  };

  const handleCloseModal = () => {
    setModalState(initialState);
    setAnchorEl(null);
  };

  return (
    <Popover
      open={!!anchorEl}
      anchorEl={anchorEl}
      onClose={handleCloseModal}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
    >
      <Box sx={{ px: 2, py: 1, position: "relative", maxWidth: 350 }}>
        <Stack
          direction={"row"}
          alignItems={"start"}
          justifyContent={"space-between"}
          spacing={2}
          sx={{ mb: 1 }}
        >
          <Box sx={{ width: 30 }}>
            {modalState.title !== initialState.title && (
              <IconButton onClick={() => setModalState(steps[0])}>
                <ArrowBackIcon />
              </IconButton>
            )}
          </Box>
          <Typography sx={{ mb: 2, py: 1, fontWeight: 500, fontSize: 16 }}>
            {modalState.title}
          </Typography>
          <IconButton onClick={handleCloseModal}>
            <CloseIcon />
          </IconButton>
        </Stack>
        <Divider />
        {
          <modalState.component
            handleClick={handleClick}
            handleCloseModal={handleCloseModal}
            {...props}
          />
        }
      </Box>
    </Popover>
  );
};

export default ListEditModal;
