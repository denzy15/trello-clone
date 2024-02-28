import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  IconButton,
  AvatarGroup,
  Avatar,
  TextField,
  Stack,
  List,
  ListItem,
  ListItemIcon,
  ListItemButton,
  ListItemText,
  ListSubheader,
  Tooltip,
  Button,
  Chip,
  Divider,
  Popover,
} from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import LabelIcon from "@mui/icons-material/LocalOffer";
import DateIcon from "@mui/icons-material/CalendarMonth";
import { useDispatch, useSelector } from "react-redux";
import DynamicModal from "./DynamicModal";
import {
  colorIsDark,
  convertUsernameForAvatar,
  getUserColor,
  formatDateWithourYear,
} from "../utils";
import {
  renameCard,
  updateCard,
  updateList,
  updateLists,
} from "../store/slices/boardsSlice";
import axiosInstance from "../axiosInterceptor";
import { SERVER_URL } from "../constants";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import SubjectIcon from "@mui/icons-material/Subject";
import DraftEditor from "./draft_editor/DraftEditor";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CardAttachmentItem from "./CardAttachmentItem";
import CommentIcon from "@mui/icons-material/Comment";
import Comment from "./Comment";
import { stopCardEdit, updateComments } from "../store/slices/metadataSlice";
import { Close, DeleteOutline } from "@mui/icons-material";

const renderDateChip = (date) => {
  const dueDate = dayjs(date);
  const currentDate = dayjs();

  const daysUntilDue = dueDate.diff(currentDate, "days");

  if (daysUntilDue < 0) {
    return (
      <Chip sx={{ m: 1 }} label={"Просрочено"} color="error" size="small" />
    );
  }

  if (daysUntilDue < 3) {
    return (
      <Chip
        sx={{ m: 1 }}
        size="small"
        color="warning"
        label={"Скоро истекает"}
      />
    );
  }

  return null;
};

const listItems = [
  {
    name: "Участники",
    icon: PersonIcon,
  },
  {
    name: "Метки",
    icon: LabelIcon,
  },
  {
    name: "Дата",
    icon: DateIcon,
  },
  {
    name: "Вложения",
    icon: AttachFileIcon,
  },
];

const CardEditModal = ({ close }) => {
  const { cardEditing } = useSelector((state) => state.metadata);
  const currentUserInfo = useSelector((state) => state.auth);

  const [currentCard, setCurrentCard] = useState(cardEditing.card);

  const { boardId } = useParams();

  const [newComment, setNewComment] = useState("");

  //ИЗМЕНЕНИЕ ЗАГОЛОВКА
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const [currentModalOpened, setCurrentModalOpened] = useState({
    name: "",
    opened: false,
    order: 0,
  });

  const [anchorEl, setAnchorEl] = useState(null);

  const dispatch = useDispatch();

  const handleUpdateComment = async (commentId, newMessage) => {
    const targetComment = cardEditing.card.comments.find(
      (c) => c._id === commentId
    );

    if (!targetComment) {
      toast.error("Что то пошло не так");
      return;
    }

    debugger;

    const copy = { ...targetComment };

    copy.message = newMessage;
    copy.updatedAt = dayjs().toDate();

    const newComments = cardEditing.card.comments.map((c) =>
      c._id === commentId ? copy : c
    );

    await axiosInstance
      .put(`${SERVER_URL}/api/cards/${boardId}/${currentCard._id}`, {
        comments: newComments,
      })
      .then(({ data }) => {
        dispatch(
          updateCard({
            card: data,
            listIndex: cardEditing.card.listInfo.index,
            cardIndex: cardEditing.card.index,
          })
        );
        dispatch(updateComments(data.comments));
      })
      .catch((e) => {
        console.log(e);
        toast.error("Не удалось обновить комментарий");
      });
  };

  const handleDeleteComment = async (commentId) => {
    const newComments = cardEditing.card.comments.filter(
      (c) => c._id !== commentId
    );

    await axiosInstance
      .put(`${SERVER_URL}/api/cards/${boardId}/${currentCard._id}`, {
        comments: newComments,
      })
      .then(({ data }) => {
        dispatch(
          updateCard({
            card: data,
            listIndex: cardEditing.card.listInfo.index,
            cardIndex: cardEditing.card.index,
          })
        );
        dispatch(updateComments(data.comments));
      })
      .catch((e) => {
        console.log(e);
        toast.error("Не удалось удалить комментарий");
      });
  };

  const handleSendComment = async () => {
    const comment = {
      message: newComment,
      author: currentUserInfo._id,
    };

    const newComments = [...cardEditing.card.comments, comment];

    await axiosInstance
      .put(`${SERVER_URL}/api/cards/${boardId}/${currentCard._id}`, {
        comments: newComments,
      })
      .then(({ data }) => {
        dispatch(
          updateCard({
            card: data,
            listIndex: cardEditing.card.listInfo.index,
            cardIndex: cardEditing.card.index,
          })
        );
        dispatch(updateComments(data.comments));
        setNewComment("");
      })
      .catch((e) => {
        console.log(e);
        toast.error("Не удалось отправить комментарий");
      });
  };

  const handleEditTitle = async (e) => {
    if (e.type === "keydown" && e.key !== "Enter") return;

    if (!currentCard.title) {
      setCurrentCard((prev) => ({ ...prev, title: cardEditing.card.title }));
      setIsEditingTitle(false);
      return;
    }

    dispatch(
      renameCard({
        listIndex: currentCard.listInfo.index,
        cardIndex: currentCard.index,
        title: currentCard.title,
      })
    );

    await axiosInstance
      .put(`${SERVER_URL}/api/cards/${boardId}/${currentCard._id}`, {
        title: currentCard.title,
      })
      .catch(() => {
        toast.error("Не удалось переименовать карточку");
        dispatch(
          renameCard({
            listIndex: currentCard.listInfo.index,
            cardIndex: currentCard.index,
            title: currentCard.title,
          })
        );
      });

    setIsEditingTitle(false);
  };

  const handleOpenModal = (name, order) => {
    if (currentModalOpened.opened && currentModalOpened.name === name) {
      setCurrentModalOpened({
        opened: false,
        name: "",
        order: 0,
      });
      return;
    }

    setCurrentModalOpened({ opened: true, name, order });
  };

  const handleDeleteCard = async () => {
    await axiosInstance
      .delete(
        `${SERVER_URL}/api/cards/${boardId}/${cardEditing.card.listInfo._id}/${cardEditing.card._id}`
      )
      .then(({ data }) => {
        // setAnchorEl(null);
        dispatch(
          updateList({
            listIndex: cardEditing.card.listInfo.index,
            list: data,
          })
        );
        dispatch(stopCardEdit());
      })
      .catch((e) => {
        console.log(e);
        toast.error("Не удалось удалить карточку, попробуйте позже");
      });
  };

  const [showAllAttachments, setShowAllAttachments] = useState(false);
  const visibleAttachments = showAllAttachments
    ? cardEditing.card.attachments
    : cardEditing.card.attachments.slice(0, 5);

  renderDateChip(currentCard.dueDate);

  return (
    <Paper
      elevation={1}
      sx={{
        position: "absolute",
        borderRadius: 0,
        top: "50px",
        left: "50%",
        transform: "translate(-50%)",
        width: "60%",
        bgcolor: "white",
        p: 4,
        zIndex: 10,
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onMouseUp={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <IconButton
        onClick={close}
        sx={{
          position: "absolute",
          right: 24,
          top: 24,
          display: "inline-block",
        }}
      >
        <CloseIcon />
      </IconButton>
      <Box
        sx={{
          pl: 3,
          position: "relative",
          display: "inline-block",
          maxWidth: "95%",
        }}
      >
        {isEditingTitle ? (
          <TextField
            value={currentCard.title}
            autoFocus
            name="title"
            size="small"
            onBlur={handleEditTitle}
            onKeyDown={handleEditTitle}
            onChange={(e) =>
              setCurrentCard((prev) => ({ ...prev, title: e.target.value }))
            }
          />
        ) : (
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              cursor: "pointer",
              display: "inline-block",
            }}
            onClick={() => setIsEditingTitle(true)}
          >
            {currentCard.title}
          </Typography>
        )}
        <Typography
          variant="subtitle2"
          sx={{
            "& > span": {
              textDecoration: "underline",
            },
          }}
        >
          В колонке <span>{currentCard.listInfo.title || "?"}</span>
        </Typography>
        <Box
          sx={{
            position: "absolute",
            left: -10,
            top: 4,
          }}
        >
          <AssignmentIcon color="action" />
        </Box>
      </Box>

      <Stack direction={"row"} sx={{ mt: 3 }}>
        <Box sx={{ pl: 3, flex: 1, position: "relative" }}>
          {/* Участники */}
          {!!cardEditing.card.assignedUsers.length && (
            <Box sx={{ mt: 2 }}>
              <Typography sx={{ mb: 0.5 }} variant="body1">
                Участники
              </Typography>
              <AvatarGroup
                max={4}
                sx={{ justifyContent: "start", cursor: "pointer" }}
                onClick={() => handleOpenModal("Участники", 0)}
              >
                {cardEditing.card.assignedUsers.map((user, idx) => (
                  <Tooltip key={idx} title={user.username + ` (${user.email})`}>
                    <Avatar key={idx} sx={{ bgcolor: getUserColor(user._id) }}>
                      {convertUsernameForAvatar(user.username)}
                    </Avatar>
                  </Tooltip>
                ))}
              </AvatarGroup>
            </Box>
          )}
          {/* Метки */}
          {!!cardEditing.card.labels.length && (
            <Box sx={{ mt: 2 }}>
              <Typography sx={{ mb: 0.5 }} variant="body1">
                Метки
              </Typography>
              <Stack
                direction={"row"}
                display={"inline-flex"}
                onClick={() => handleOpenModal("Метки", 1)}
                sx={{ flexWrap: "wrap", gap: 1 }}
              >
                {cardEditing.card.labels.map((lbl) => (
                  <Box
                    key={lbl._id}
                    sx={{
                      cursor: "pointer",
                      p: 1,
                      borderRadius: 1,
                      bgcolor: lbl.color,
                      minWidth: 48,
                      height: 30,
                      color: colorIsDark(lbl.color) ? "white" : "black",
                    }}
                  >
                    {lbl.title}
                  </Box>
                ))}
                <Box
                  sx={{
                    cursor: "pointer",
                    p: 1,
                    borderRadius: 1,
                    bgcolor: "#eeeeee",
                    minWidth: 48,
                    height: 30,
                    fontSize: 25,
                    fontWeight: 600,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  +
                </Box>
              </Stack>
            </Box>
          )}

          {/* Даты*/}
          <Box sx={{ mt: 2 }}>
            {cardEditing.card.startDate && cardEditing.card.dueDate && (
              <>
                <Typography variant="h6">Даты</Typography>
                <Box
                  onClick={() => handleOpenModal("Дата", 2)}
                  sx={{
                    cursor: "pointer",
                    mt: 1,
                    bgcolor: "#eeeeee",
                    display: "inline-block",
                    p: 1,
                    borderRadius: 2,
                  }}
                >
                  {dayjs(cardEditing.card.startDate).format("DD MMM")} —{" "}
                  {formatDateWithourYear(cardEditing.card.dueDate)}
                  {renderDateChip(cardEditing.card.dueDate)}
                </Box>
              </>
            )}
            {cardEditing.card.startDate && !cardEditing.card.dueDate && (
              <>
                <Typography variant="h6">Начало</Typography>
                <Typography
                  onClick={() => handleOpenModal("Дата", 2)}
                  sx={{
                    cursor: "pointer",
                    mt: 1,
                    bgcolor: "#eeeeee",
                    display: "inline-block",
                    p: 1,
                    borderRadius: 2,
                  }}
                >
                  {dayjs(cardEditing.card.startDate).format("DD MMM YYYY")}
                </Typography>
              </>
            )}
            {!cardEditing.card.startDate && cardEditing.card.dueDate && (
              <>
                <Typography variant="h6">Срок</Typography>
                <Box
                  onClick={() => handleOpenModal("Дата", 2)}
                  sx={{
                    mt: 1,
                    cursor: "pointer",
                    bgcolor: "#eeeeee",
                    display: "inline-block",
                    p: 1,
                    borderRadius: 2,
                  }}
                >
                  {dayjs(cardEditing.card.dueDate).format("DD MMM YYYY, HH:mm")}
                  {renderDateChip(cardEditing.card.dueDate)}
                </Box>
              </>
            )}
          </Box>
          {/* Описание*/}
          <Box sx={{ width: "100%", position: "relative" }}>
            <SubjectIcon
              sx={{ position: "absolute", top: 4, left: -30, fontSize: 25 }}
            />
            <Typography sx={{ my: 1 }} variant="h6">
              Описание
            </Typography>
            <DraftEditor />
          </Box>
          {/* Вложения */}
          {cardEditing.card.attachments.length > 0 && (
            <Box sx={{ position: "relative" }}>
              <AttachFileIcon
                sx={{
                  position: "absolute",
                  top: 10,
                  left: -30,
                  fontSize: 25,
                  transform: "rotate(45deg)",
                }}
              />
              <Stack direction="row" justifyContent="space-between">
                <Typography sx={{ my: 1 }} variant="h6">
                  Вложения
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => handleOpenModal("Вложения", 3)}
                >
                  Добавить
                </Button>
              </Stack>
              <Box
                sx={{
                  mt: 2,
                  display: "flex",
                  flexDirection: "column",
                  gap: 3,
                }}
              >
                {visibleAttachments.map((att, i) => (
                  <CardAttachmentItem key={i} {...att} index={i} />
                ))}
              </Box>
              {cardEditing.card.attachments.length > 5 && (
                <Button
                  sx={{ mt: 1 }}
                  variant="outlined"
                  onClick={() => setShowAllAttachments((pr) => !pr)}
                >
                  {!showAllAttachments
                    ? "Показать остальное (" +
                      (cardEditing.card.attachments.length -
                        visibleAttachments.length) +
                      ")"
                    : "Показать меньше"}
                </Button>
              )}
            </Box>
          )}
          {/* Комменты */}
          <Box sx={{ position: "relative", mt: 3 }}>
            <CommentIcon
              sx={{ position: "absolute", top: 4, left: -30, fontSize: 25 }}
            />
            <Typography sx={{ my: 1 }} variant="h6">
              Комментарии
            </Typography>
          </Box>
          <Stack direction={"row"} spacing={1} alignItems={"center"}>
            <Tooltip
              title={currentUserInfo.username + ` (${currentUserInfo.email})`}
            >
              <Avatar sx={{ bgcolor: getUserColor(currentUserInfo._id) }}>
                {convertUsernameForAvatar(currentUserInfo.username)}
              </Avatar>
            </Tooltip>
            <TextField
              multiline
              placeholder="Напишите комментарий..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              size="small"
              sx={{ flexGrow: 1 }}
            />
          </Stack>
          {!!newComment && (
            <Button
              sx={{ mt: 1, float: "right" }}
              variant="contained"
              size="small"
              onClick={handleSendComment}
            >
              Отправить
            </Button>
          )}
          <Divider sx={{ my: 3 }} />
          <Stack direction={"column"} spacing={2}>
            {cardEditing.card.comments.map((comment) => (
              <Comment
                key={comment._id}
                handleUpdateComment={handleUpdateComment}
                handleDeleteComment={handleDeleteComment}
                {...comment}
              />
            ))}
          </Stack>
        </Box>
        <Box>
          <List
            disablePadding
            subheader={
              <ListSubheader sx={{ lineHeight: 1, position: "static" }}>
                Добавить на карточку
              </ListSubheader>
            }
          >
            {listItems.map((item, i) => (
              <ListItem key={i}>
                <ListItemButton
                  sx={{ p: 0.3 }}
                  onClick={() => {
                    handleOpenModal(item.name, i);
                  }}
                >
                  <ListItemIcon>
                    <item.icon />
                  </ListItemIcon>
                  <ListItemText primary={item.name} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider />
          <List disablePadding>
            <ListItem>
              <ListItemButton
                onClick={(e) => setAnchorEl(e.currentTarget)}
                sx={{
                  p: 0.3,
                  bgcolor: "#ff6c62",
                  "&:hover": {
                    bgcolor: "#e75046",
                  },
                }}
              >
                <ListItemIcon>
                  <DeleteOutline />
                </ListItemIcon>
                <ListItemText primary="Удалить" />
              </ListItemButton>
            </ListItem>
          </List>
          <Popover
            open={!!anchorEl}
            anchorEl={anchorEl}
            onClose={() => setAnchorEl(null)}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
          >
            <Box sx={{ position: "relative", p: 2, maxWidth: 300 }}>
              <IconButton
                sx={{ position: "absolute", right: 0, top: 0 }}
                onClick={() => setAnchorEl(null)}
              >
                <Close />
              </IconButton>
              <Typography sx={{ textAlign: "center", mb: 1 }} variant="h6">
                Удаление карточки
              </Typography>
              <Typography variant="body2">
                Все данные о карточке будут удалены, и вы не сможете повторно
                открыть карточку. Отмена невозможна
              </Typography>
              <Button
                color="error"
                variant="contained"
                sx={{ mt: 1.5 }}
                onClick={handleDeleteCard}
              >
                Удалить
              </Button>
            </Box>
          </Popover>
        </Box>
      </Stack>

      {currentModalOpened.opened && (
        <DynamicModal
          header={currentModalOpened.name}
          closeModal={() =>
            setCurrentModalOpened({ name: "", opened: false, order: 0 })
          }
          order={currentModalOpened.order}
        />
      )}
    </Paper>
  );
};

export default CardEditModal;
