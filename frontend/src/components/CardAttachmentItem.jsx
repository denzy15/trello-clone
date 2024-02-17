import {
  Box,
  Button,
  Divider,
  Popover,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { SERVER_URL } from "../constants";
import dayjs from "dayjs";
import { getFileExtension, getFileType } from "../utils";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteAttach,
  updateCardAttachName,
} from "../store/slices/metadataSlice";
import axiosInstance from "../axiosInterceptor";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { updateCard } from "../store/slices/boardsSlice";

const CardAttachmentItem = (props) => {
  const { createdAt, creator, name, path, type, index, _id } = props;

  const [openImage, setOpenImage] = useState(false);

  const { boardId } = useParams();
  const { cardEditing } = useSelector((state) => state.metadata);

  const dispatch = useDispatch();

  const [anchorEl1, setAnchorEl1] = useState(null);
  const [anchorEl2, setAnchorEl2] = useState(null);

  const [newName, setNewName] = useState(name);

  const id1 = !!anchorEl1 ? "simple-popper-1" : undefined;
  const id2 = !!anchorEl2 ? "simple-popper-2" : undefined;

  const updateAttachName = async (e) => {
    e.stopPropagation();
    if (!newName) {
      setNewName(name);
      setAnchorEl1(null);
      return;
    }

    await axiosInstance
      .put(
        `${SERVER_URL}/api/cards/${boardId}/${cardEditing.card._id}/attach`,
        {
          name: newName,
          attachId: _id,
        }
      )
      .then(({ data }) => {
        dispatch(
          updateCard({
            card: data,
            listIndex: cardEditing.card.listInfo.index,
            cardIndex: cardEditing.card.index,
          })
        );
      })
      .catch(() => {
        toast.error("Не удалось обновить название");
      });

    dispatch(updateCardAttachName({ index, name: newName }));

    // const { data } = await axiosInstance.get(
    //   `${SERVER_URL}/api/cards/${boardId}/${cardEditing.card._id}`
    // );

    setAnchorEl1(null);
  };

  const deleteAttachHandler = async (e) => {
    e.stopPropagation();
    await axiosInstance
      .put(
        `${SERVER_URL}/api/cards/${boardId}/${cardEditing.card._id}/attach`,
        {
          attachId: _id,
        }
      )
      .then(({ data }) => {
        dispatch(
          updateCard({
            card: data,
            listIndex: cardEditing.card.listInfo.index,
            cardIndex: cardEditing.card.index,
          })
        );
      })
      .catch((e) => {
        toast.error("Не удалось удалить вложение");
      });

    dispatch(deleteAttach({ index }));

    setAnchorEl2(null);
  };

  const handleDownload = () => {
    const downloadLink = document.createElement("a");
    downloadLink.href = SERVER_URL + "/" + path;
    downloadLink.target = "_blank";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent={"flex-start"}
      spacing={1}
      sx={{
        borderRadius: 1,
        cursor: "pointer",
        "&:hover": {
          bgcolor: "#f5f5f5",
        },
      }}
    >
      <Box
        sx={{
          flexBasis: "25%",
          bgcolor: "#b3b3b3",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          aspectRatio: 16 / 9,
        }}
        onClick={
          getFileType(type) === "image"
            ? () => setOpenImage(true)
            : handleDownload
        }
      >
        {getFileType(type) === "image" ? (
          <img
            src={`${SERVER_URL}/${path}`}
            alt={name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <Typography variant="h6">{getFileExtension(path)}</Typography>
        )}
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography variant="body1" sx={{ fontWeight: 500, fontSize: 16 }}>
          {name}
        </Typography>
        <Typography variant="subtitle2">
          Добавлено {dayjs(createdAt).format("DD.MM.YYYY, в HH:mm")}
        </Typography>
        <Stack direction={"row"} sx={{ color: "gray", mt: 0.5 }}>
          <Button
            aria-describedby={id1}
            size="small"
            color="inherit"
            onClick={(e) => {
              e.stopPropagation();
              setAnchorEl1(e.currentTarget);
            }}
          >
            Изменить
          </Button>
          <Divider orientation="vertical" flexItem />
          <Button
            color="inherit"
            size="small"
            onClick={(e) => {
              setAnchorEl2(e.currentTarget);
            }}
          >
            Удалить
          </Button>
        </Stack>
        <Popover
          id={id1}
          open={!!anchorEl1}
          anchorEl={anchorEl1}
          onClose={() => setAnchorEl1(null)}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
        >
          <Box sx={{ py: 1, px: 2, bgcolor: "#f5f5f5" }}>
            <Typography sx={{ textAlign: "center", mb: 1, fontWeight: 500 }}>
              Изменить вложение
            </Typography>
            <Typography variant="subtitle2">Новое название:</Typography>
            <TextField
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              size="small"
              fullWidth
            />
            <Button size="small" sx={{ my: 1 }} onClick={updateAttachName}>
              Обновить
            </Button>
          </Box>
        </Popover>
        <Popover
          id={id2}
          open={!!anchorEl2}
          anchorEl={anchorEl2}
          onClose={(e) => {
            e.stopPropagation();
            setAnchorEl2(null);
          }}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
        >
          <Box sx={{ py: 1, px: 2, bgcolor: "#f5f5f5", maxWidth: 300 }}>
            <Typography sx={{ textAlign: "center", mb: 1, fontWeight: 500 }}>
              Удалить вложениe
            </Typography>
            <Typography variant="subtitle2">
              Удаление вложения необратимо. Отмена невозможна
            </Typography>
            <Button
              fullWidth
              variant="contained"
              color="error"
              size="small"
              sx={{ my: 1 }}
              onClick={deleteAttachHandler}
            >
              Удалить
            </Button>
          </Box>
        </Popover>
        {openImage && (
          <Popover
            sx={{ bgcolor: "rgba(0, 0, 0, 0.5)" }}
            open={openImage}
            anchorEl={document.querySelector("#root")}
            onClose={(e) => {
              e.stopPropagation();
              setOpenImage(false);
            }}
            anchorOrigin={{
              vertical: "center",
              horizontal: "center",
            }}
            transformOrigin={{
              vertical: "center",
              horizontal: "center",
            }}
          >
            <Box>
              <img
                src={`${SERVER_URL}/${path}`}
                alt={name}
                style={{ maxWidth: "100%", maxHeight: "100%" }}
              />
            </Box>
          </Popover>
        )}
      </Box>
    </Stack>
  );
};

export default CardAttachmentItem;
