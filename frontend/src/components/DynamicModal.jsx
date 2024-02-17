import React from "react";
import UserEdit from "./card_modals/UserEdit";
import LabelsEdit from "./card_modals/LabelsEdit";
import DateEdit from "./card_modals/DateEdit";
import { ClickAwayListener } from "@mui/base/ClickAwayListener";
import { IconButton, Paper, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AttachmentsModal from "./card_modals/AttachmentsModal";

const components = {
  Участники: UserEdit,
  Метки: LabelsEdit,
  Дата: DateEdit,
  Вложения: AttachmentsModal,
};

const DynamicModal = ({ header, closeModal, order, ...rest }) => {
  const Component = components[header];
  return (
    <Paper
      elevation={4}
      sx={{
        position: "absolute",
        p: 1,
        minWidth: 300,
        right: 0,
        maxHeight: 50 - (order + 1) * 5 + "vh",
        overflow: "auto",
        top: 45 * (order + 1) + 50,
        zIndex: 15,
      }}
    >
      <IconButton
        onClick={closeModal}
        sx={{ position: "absolute", right: 0, top: 2 }}
      >
        <CloseIcon />
      </IconButton>
      <Typography
        sx={{
          textAlign: "center",
          mb: 2,
          mt: 1,
          fontWeight: 600,
          fontSize: 16,
        }}
      >
        {header}
      </Typography>

      <Component header={header} closeModal={closeModal} {...rest} />
    </Paper>
  );
};

export default DynamicModal;
