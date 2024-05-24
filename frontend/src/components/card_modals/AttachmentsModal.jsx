import React, { useState } from "react";
import "filepond/dist/filepond.min.css";
import { Box, Button, Typography } from "@mui/material";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import { useDispatch, useSelector } from "react-redux";
import { SERVER_URL } from "../../constants";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import axiosInstance from "../../axiosInterceptor";
import { toast } from "react-toastify";
import { updateCard } from "../../store/slices/boardsSlice";
import { updateCardAttachments } from "../../store/slices/metadataSlice";

const AttachmentsModal = ({ closeModal }) => {
  const { cardEditing } = useSelector((state) => state.metadata);
  const { currentBoard } = useSelector((state) => state.boards);

  const dispatch = useDispatch();
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = async (event) => {
    const selectedFiles = Array.from(event.target.files);
    await uploadFiles(selectedFiles);
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    const droppedFiles = Array.from(event.dataTransfer.files);
    await uploadFiles(droppedFiles);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const uploadFiles = async (files) => {
    try {
      for (const file of files) {
        if (file.size > 10 * 1024 * 1024) {
          toast.warn(`Файл ${file.name} превышает максимально допустимый размер (10 МБ)`);
          continue;
        }

        const formData = new FormData();
        formData.append("file", file);

        await toast.promise(
          axiosInstance.post(
            `${SERVER_URL}/api/cards/${currentBoard._id}/${cardEditing.card._id}/upload-files`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          ),
          {
            pending: "Загрузка файла...",
            success: "Файл успешно загружен",
            error: "Ошибка при загрузке файла",
          }
        );

        const { data } = await axiosInstance.get(
          `${SERVER_URL}/api/cards/${currentBoard._id}/${cardEditing.card._id}`
        );

        dispatch(
          updateCard({
            card: data,
            listIndex: cardEditing.card.listInfo.index,
            cardIndex: cardEditing.card.index,
          })
        );
        dispatch(updateCardAttachments(data.attachments));
      }
      closeModal();
    } catch (e) {
      toast.error(e.response.data.message || "Ошибка при отправке файлов: " + e);
    }
  };

  return (
    <Box
      sx={{
        py: 4,
        border: isDragging ? '2px dashed #000' : '2px solid transparent',
        borderRadius: 1,
        textAlign: 'center',
        position: 'relative',
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <Button
        component="label"
        variant="contained"
        fullWidth
        startIcon={<CloudUploadIcon />}
      >
        Загрузить файл
        <input
          multiple
          onChange={handleFileChange}
          style={{
            clip: "rect(0 0 0 0)",
            clipPath: "inset(50%)",
            height: 1,
            overflow: "hidden",
            position: "absolute",
            bottom: 0,
            left: 0,
            whiteSpace: "nowrap",
            width: 1,
          }}
          type="file"
        />
      </Button>
      <Typography sx={{mt:1}}>Либо перетащите файлы в эту область</Typography>
      {isDragging && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        >
        </Box>
      )}
    </Box>
  );
};

export default AttachmentsModal;