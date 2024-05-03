import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  Stack,
  Typography,
} from "@mui/material";
import { DateCalendar } from "@mui/x-date-pickers";
import { StaticDateTimePicker } from "@mui/x-date-pickers/StaticDateTimePicker";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axiosInstance from "../../axiosInterceptor";
import { SERVER_URL } from "../../constants";
import { toast } from "react-toastify";
import { updateCardDates } from "../../store/slices/metadataSlice";
import { updateCard } from "../../store/slices/boardsSlice";
import { getTheme } from "../../theme";

const DateEdit = ({ closeModal }) => {
  const { cardEditing } = useSelector((state) => state.metadata);
  const { currentBoard } = useSelector((state) => state.boards);
  const { mode } = useSelector((state) => state.theme);
  const theme = getTheme(mode);

  const [startDate, setStartDate] = useState(
    dayjs(cardEditing.card.startDate || dayjs())
  );

  const [dueDate, setDueDate] = useState(
    dayjs(cardEditing.card.dueDate || dayjs().add(5, "day").set("minutes", 0))
  );

  const [startDateActive, setStartDateActive] = useState(
    !!cardEditing.card.startDate
  );

  const [dueDateActive, setDueDateActive] = useState(
    !!cardEditing.card.dueDate
  );

  const dispatch = useDispatch();

  const handleSave = async () => {
    await axiosInstance
      .put(
        `${SERVER_URL}/api/cards/${currentBoard._id}/${cardEditing.card._id}`,
        {
          startDate: startDateActive ? startDate.toString() : null,
          dueDate: dueDateActive ? dueDate.toString() : null,
        }
      )
      .catch((e) => {
        toast.error(
          e.response.data.message ||
            "Не удалось обновить дату, попробуйте позже"
        );
      })
      .finally(() => {
        closeModal();
      });

    const { data } = await axiosInstance.get(
      `${SERVER_URL}/api/cards/${currentBoard._id}/${cardEditing.card._id}`
    );

    dispatch(
      updateCard({
        listIndex: cardEditing.card.listInfo.index,
        cardIndex: cardEditing.card.index,
        card: data,
      })
    );
    dispatch(
      updateCardDates({
        startDate: startDateActive ? startDate.toString() : null,
        dueDate: dueDateActive ? dueDate.toString() : null,
      })
    );
  };

  const handleDelete = async () => {
    try {
      await axiosInstance.put(
        `${SERVER_URL}/api/cards/${currentBoard._id}/${cardEditing.card._id}`,
        { startDate: null, dueDate: null }
      );

      const { data } = await axiosInstance.get(
        `${SERVER_URL}/api/cards/${currentBoard._id}/${cardEditing.card._id}`
      );

      dispatch(
        updateCard({
          listIndex: cardEditing.card.listInfo.index,
          cardIndex: cardEditing.card.index,
          card: data,
        })
      );
      dispatch(updateCardDates({ startDate: null, dueDate: null }));
    } catch (e) {
      toast.error(
        e.response.data.message || "Не удалось обновить дату, попробуйте позже"
      );
    } finally {
      closeModal();
    }
  };

  return (
    <Box
      sx={{
        overflow: "auto",
        px: 2,
        py: 1,
        maxHeight: "100%",
        position: "relative",
        zIndex: 22,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <Stack
        direction={"row"}
        alignItems={"center"}
        spacing={2}
        sx={{
          borderRadius: 2,
          borderBottom: `2px solid ${theme.palette.text.primary}`,
          borderTop: `2px solid ${theme.palette.text.primary}`,
        }}
      >
        <FormControlLabel
          control={
            <Checkbox
              checked={startDateActive}
              onChange={() => setStartDateActive((v) => !v)}
            />
          }
          label="Начало"
        />
        <Typography textAlign={"center"} variant="h6">
          {startDateActive &&
            startDate.format("DD MMMM YYYY", { locale: "ru" })}
        </Typography>
      </Stack>
      {startDateActive && (
        <Box>
          <DateCalendar
            value={startDate}
            onChange={(newValue) => setStartDate(newValue)}
          />
        </Box>
      )}

      <Divider sx={{ my: 2 }} />

      <Stack
        direction={"row"}
        alignItems={"center"}
        spacing={2}
        sx={{
          borderBottom: `2px solid ${theme.palette.text.primary}`,
          borderTop: `2px solid ${theme.palette.text.primary}`,
          borderRadius: 2,
        }}
      >
        <FormControlLabel
          control={
            <Checkbox
              checked={dueDateActive}
              onChange={() => setDueDateActive((v) => !v)}
            />
          }
          label="Срок"
        />
        <Typography textAlign={"center"} variant="h6">
          {dueDateActive &&
            dueDate.format("DD MMMM YYYY,  HH:mm", { locale: "ru" })}
        </Typography>
      </Stack>

      {dueDateActive && (
        <StaticDateTimePicker
          sx={{
            "& .MuiPickersLayout-actionBar ": {
              display: "none",
            },
          }}
          localeText={{
            toolbarTitle: "Выбрать дату и время окончания",
          }}
          value={dueDate}
          onChange={(newValue) => setDueDate(newValue)}
        />
      )}

      <Box sx={{ mt: 3 }}>
        <Button
          variant="contained"
          sx={{ mb: 1 }}
          fullWidth
          onClick={handleSave}
        >
          Сохранить
        </Button>
        <Button
          variant="outlined"
          color="error"
          fullWidth
          onClick={handleDelete}
        >
          Удалить
        </Button>
      </Box>
    </Box>
  );
};

export default DateEdit;
