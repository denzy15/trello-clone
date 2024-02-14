import React, { useState } from "react";
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
} from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import LabelIcon from "@mui/icons-material/LocalOffer";
import DateIcon from "@mui/icons-material/CalendarMonth";
import { useDispatch, useSelector } from "react-redux";
import DynamicModal from "./DynamicModal";
import { convertUsernameForAvatar, getUserColor } from "../utils";
import { renameCard } from "../store/slices/boardsSlice";
import axiosInstance from "../axiosInterceptor";
import { SERVER_URL } from "../constants";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { EditorState, RichUtils } from "draft-js";
import SubjectIcon from "@mui/icons-material/Subject";
import DraftEditor from "./draft_editor/DraftEditor";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CardAttachmentItem from "./CardAttachmentItem";

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
  const [currentCard, setCurrentCard] = useState(cardEditing.card);

  const { boardId } = useParams();

  //ИЗМЕНЕНИЕ ЗАГОЛОВКА
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const [currentModalOpened, setCurrentModalOpened] = useState({
    name: "",
    opened: false,
    order: 0,
  });

  const dispatch = useDispatch();

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
  return (
    <Paper
      elevation={1}
      sx={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "60%",
        bgcolor: "white",
        p: 4,
        maxHeight: "100vh",
        zIndex: 10,
        overflowY: "auto",
      }}
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
      <Box sx={{ pl: 3, position: "relative", display: "inline-block" }}>
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
            sx={{ fontWeight: 600, cursor: "pointer", display: "inline-block" }}
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
          {!!cardEditing.card.assignedUsers.length && (
            <Box sx={{ mt: 2 }}>
              <Typography sx={{ mb: 1 }} variant="h6">
                Участники:
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
          <Box>
            {cardEditing.card.startDate && cardEditing.card.dueDate && (
              <>
                <Typography variant="h6">Даты:</Typography>
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
                  {dayjs(cardEditing.card.startDate).format("DD MMM YYYY")} -{" "}
                  {dayjs(cardEditing.card.dueDate).format("DD MMM YYYY, hh:mm")}
                </Typography>
              </>
            )}
            {cardEditing.card.startDate && !cardEditing.card.dueDate && (
              <>
                <Typography variant="h6">Начало:</Typography>
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
                <Typography variant="h6">Срок:</Typography>
                <Typography
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
                  {dayjs(cardEditing.card.dueDate).format("DD MMM YYYY, hh:mm")}
                </Typography>
              </>
            )}
          </Box>
          <Box sx={{ width: "100%", position: "relative" }}>
            <SubjectIcon
              sx={{ position: "absolute", top: 4, left: -30, fontSize: 25 }}
            />
            <Typography sx={{ my: 1 }} variant="h6">
              Описание:
            </Typography>
            <DraftEditor />
          </Box>

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
                  Вложения:
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
                sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 3 }}
              >
                {cardEditing.card.attachments.map((att, i) => (
                  <CardAttachmentItem key={i} {...att} index={i} />
                ))}
              </Box>
            </Box>
          )}
        </Box>
        <Box>
          <List
            disablePadding
            subheader={
              <ListSubheader sx={{ lineHeight: 1 }}>
                Добавить на карточку
              </ListSubheader>
            }
          >
            {listItems.map((item, i) => (
              <ListItem key={i}>
                <ListItemButton
                  sx={{ p: 0 }}
                  onClick={(e) => {
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