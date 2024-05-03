import React from "react";
import "filepond/dist/filepond.min.css";
import { Box, Button } from "@mui/material";
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

  const handleFileChange = async (event) => {
    const selectedFiles = Array.from(event.target.files);

    try {
      for (const file of selectedFiles) {
        if (file.size > 10 * 1024 * 1024) {
          toast.warn(
            `Файл ${file.name} превышает максимально допустимый размер (10 МБ)`
          );
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
      toast.error(
        e.response.data.message || "Ошибка при отправке файлов: " + e
      );
    }
  };

  return (
    <Box sx={{ py: 2 }}>
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
    </Box>
  );
};

export default AttachmentsModal;
