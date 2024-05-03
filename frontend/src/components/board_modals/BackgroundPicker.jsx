import {
  Box,
  Button,
  Divider,
  Grid,
  Paper,
  Typography,
} from "@mui/material";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { getTheme } from "../../theme";
import BackgroundItem from "../BackgroundItem";
import Add from "@mui/icons-material/Add";
import { toast } from "react-toastify";
import axiosInstance from "../../axiosInterceptor";
import { SERVER_URL } from "../../constants";
import { useParams } from "react-router-dom";
import {
  setBoardBackground,
  updateBoardBackgrounds,
} from "../../store/slices/boardsSlice";

const commonBackgrounds = [
  { name: "alien", path: `backgrounds/common/alien.svg` },
  { name: "crystal", path: `backgrounds/common/crystal.svg` },
  { name: "earth", path: `backgrounds/common/earth.svg` },
  { name: "flower", path: `backgrounds/common/flower.svg` },
  { name: "ocean", path: `backgrounds/common/ocean.svg` },
  { name: "peach", path: `backgrounds/common/peach.svg` },
  { name: "rainbow", path: `backgrounds/common/rainbow.svg` },
  { name: "snow", path: `backgrounds/common/snow.svg` },
  { name: "volcano", path: `backgrounds/common/volcano.svg` },
];

const BackgroundPicker = () => {
  const { boardId } = useParams();

  const { mode } = useSelector((state) => state.theme);
  const theme = getTheme(mode);

  const { currentBoard } = useSelector((state) => state.boards);

  const dispatch = useDispatch();

  const handleFileChange = async (event) => {
    const file = event.target.files[0];

    if (!file) {
      toast.error("Файл не выбран");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      toast.warn(
        `Файл ${file.name} превышает максимально допустимый размер (20 МБ)`
      );
      return;
    }

    const formData = new FormData();
    formData.append("background", file);

    try {
      const { data } = await toast.promise(
        axiosInstance.post(
          `${SERVER_URL}/api/boards/${boardId}/upload-background`,
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

      await axiosInstance.put(
        `${SERVER_URL}/api/boards/${boardId}/change-background`,
        { backgroundPath: data[data.length - 1].path }
      );

      dispatch(updateBoardBackgrounds(data));
      dispatch(setBoardBackground(data[data.length - 1].path));
    } catch (e) {
      toast.error(
        e.response.data.message || "Ошибка при загрузке файлов: " + e
      );
    }
  };

  const handlePickBg = async (backgroundPath) => {
    if (backgroundPath === currentBoard.currentBackground) return;

    await axiosInstance
      .put(`${SERVER_URL}/api/boards/${boardId}/change-background`, {
        backgroundPath,
      })
      .catch((e) => {
        toast.error(e.response.data.message || "Не удалось установить фон");
      });

    dispatch(setBoardBackground(backgroundPath));
  };

  const handleDeleteBg = async (background) => {
    if (background.path === currentBoard.currentBackground) {
      dispatch(setBoardBackground("backgrounds/common/snow.svg"));
    }

    try {
      const { data } = await axiosInstance.put(
        `${SERVER_URL}/api/boards/${boardId}/delete-background`,
        {
          background,
        }
      );

      dispatch(updateBoardBackgrounds(data.backgrounds));
    } catch (e) {
      toast.error(e.response.data.message || "Не удалось удалить фон");
    }
  };

  return (
    <Box sx={{ p: 2, maxWidth: { md: "25vw" } }}>
      <Typography variant="h5" textAlign={"center"} marginBottom={0.5}>
        Цвета
      </Typography>
      <Divider sx={{ bgcolor: theme.palette.text.secondary }} />
      <Grid sx={{ my: 1 }} container rowSpacing={2} columnSpacing={1}>
        {commonBackgrounds.map((bg, i) => (
          <BackgroundItem key={i} bg={bg} handlePickBg={handlePickBg} />
        ))}
      </Grid>
      <Typography variant="h5" textAlign={"center"} marginBottom={0.5}>
        Пользовательские
      </Typography>
      <Divider sx={{ bgcolor: theme.palette.text.secondary }} />
      <Grid sx={{ my: 1 }} container rowSpacing={2} columnSpacing={1}>
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            cursor: "pointer",
          }}
        >
          <Paper
            sx={{
              height: 80,
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Button
              aria-label="upload-bg"
              component="label"
              sx={{ width: "100%", height: "100%", borderRadius: 0 }}
              color="inherit"
            >
              <Add sx={{ fontSize: 40 }} />
              <input
                name="background"
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
                type="image"
                alt="bg picker"
              />
            </Button>
          </Paper>
        </Grid>

        {currentBoard.backgrounds &&
          currentBoard.backgrounds.map((bg) => (
            <BackgroundItem
              key={bg._id}
              bg={bg}
              handlePickBg={handlePickBg}
              handleDeleteBg={handleDeleteBg}
            />
          ))}
      </Grid>
    </Box>
  );
};

export default BackgroundPicker;
