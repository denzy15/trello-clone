import React, { useRef, useState } from "react";
import {
  Editor,
  EditorState,
  RichUtils,
  convertToRaw,
  convertFromRaw,
} from "draft-js";
import Toolbar from "./Toolbar";
import "./DraftEditor.css";
import { Box, Button, Divider, Stack } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import {
  toggleEditableDraft,
  updateCardDescription,
} from "../../store/slices/metadataSlice";
import axiosInstance from "../../axiosInterceptor";
import { SERVER_URL } from "../../constants";
import { toast } from "react-toastify";
import {
  updateBoardDescription,
  updateCard,
} from "../../store/slices/boardsSlice";
import { getTheme } from "../../theme";

const DraftEditor = () => {
  const { cardEditing, editableDraft, role } = useSelector(
    (state) => state.metadata
  );
  const { currentBoard } = useSelector((state) => state.boards);

  const dispatch = useDispatch();

  const createEditorState = () => {
    if (cardEditing.isEditing) {
      if (!cardEditing.card.description) {
        return EditorState.createEmpty();
      }

      const contentState = convertFromRaw(
        JSON.parse(cardEditing.card.description)
      );
      const newEditorState = EditorState.createWithContent(contentState);

      return newEditorState;
    }

    if (!currentBoard.description) {
      return EditorState.createEmpty();
    }

    const contentState = convertFromRaw(JSON.parse(currentBoard.description));
    const newEditorState = EditorState.createWithContent(contentState);

    return newEditorState;
  };

  const [editorState, setEditorState] = useState(() => createEditorState());
  const editor = useRef(null);

  const focusEditor = () => {
    if (!cardEditing.isEditing && role !== "ADMIN") return;

    if (!editableDraft) dispatch(toggleEditableDraft());
    editor.current.focus();
  };

  const handleKeyCommand = (command) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      setEditorState(newState);
      return true;
    }
    return false;
  };

  const styleMap = {
    CODE: {
      backgroundColor: "rgba(0, 0, 0, 0.05)",
      fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
      fontSize: 16,
      padding: 2,
    },
    HIGHLIGHT: {
      backgroundColor: "#F7A5F7",
    },
    UPPERCASE: {
      textTransform: "uppercase",
    },
    LOWERCASE: {
      textTransform: "lowercase",
    },
    CODEBLOCK: {
      fontFamily: '"fira-code", "monospace"',
      fontSize: "inherit",
      background: "#ffeff0",
      fontStyle: "italic",
      lineHeight: 1.5,
      padding: "0.3rem 0.5rem",
      borderRadius: " 0.2rem",
    },
    SUPERSCRIPT: {
      verticalAlign: "super",
      fontSize: "80%",
    },
    SUBSCRIPT: {
      verticalAlign: "sub",
      fontSize: "80%",
    },
  };

  const myBlockStyleFn = (contentBlock) => {
    const type = contentBlock.getType();
    switch (type) {
      case "blockQuote":
        return "superFancyBlockquote";
      case "leftAlign":
        return "leftAlign";
      case "rightAlign":
        return "rightAlign";
      case "centerAlign":
        return "centerAlign";
      case "justifyAlign":
        return "justifyAlign";
      default:
        break;
    }
  };

  const updateCardDescriptionOnServer = async (contentString) => {
    try {
      await axiosInstance.put(
        `${SERVER_URL}/api/cards/${currentBoard._id}/${cardEditing.card._id}`,
        { description: contentString }
      );
      const { data } = await axiosInstance.get(
        `${SERVER_URL}/api/cards/${currentBoard._id}/${cardEditing.card._id}`
      );
      return data;
    } catch (e) {
      throw new Error(
        e.response.data.message || "Не удалось сохранить описание"
      );
    }
  };

  const updateBoardDescriptionOnServer = async (contentString) => {
    try {
      await axiosInstance.put(`${SERVER_URL}/api/boards/${currentBoard._id}`, {
        description: contentString,
      });
    } catch (e) {
      throw new Error(
        e.response.data.message || "Не удалось сохранить описание"
      );
    }
  };

  const handleSaveDescription = async () => {
    const contentState = editorState.getCurrentContent();
    const contentRaw = convertToRaw(contentState);
    const contentString = JSON.stringify(contentRaw);

    try {
      if (!cardEditing.isEditing) {
        await updateBoardDescriptionOnServer(contentString);
        dispatch(updateBoardDescription(contentString));
        return;
      }

      const updatedCardData = await updateCardDescriptionOnServer(
        contentString
      );
      dispatch(updateCardDescription(contentString));
      dispatch(
        updateCard({
          listIndex: cardEditing.card.listInfo.index,
          cardIndex: cardEditing.card.index,
          card: updatedCardData,
        })
      );
    } catch (e) {
      toast.error(
        e.response.data.message ||
          "Не удалось обновить описание, попробуйте позже"
      );
    } finally {
      dispatch(toggleEditableDraft());
    }
  };

  const handleCancelEdit = () => {
    const newState = createEditorState();
    setEditorState(newState);
    dispatch(toggleEditableDraft());
  };

  const { mode } = useSelector((state) => state.theme);
  const theme = getTheme(mode);

  return (
    <React.Fragment>
      <Box
        sx={{
          border: !editableDraft
            ? "none"
            : `1px solid ${theme.palette.background.paper}`,
          bgcolor: "#f5f5f5",
          borderRadius: 1,
          p: 1,
          pl: editableDraft && 0,
          maxWidth: "100%",
          fontFamily: "Montserrat, sans-serif",
          color: "#000",
        }}
        onClick={focusEditor}
      >
        {editableDraft && (
          <Toolbar editorState={editorState} setEditorState={setEditorState} />
        )}
        {editableDraft && <Divider sx={{ my: 1 }} color="black" />}
        <Box
          sx={{
            cursor: !editableDraft && "pointer",
            bgcolor: editableDraft ? "#fff" : "#f5f5f5",
            px: 2,
            py: 1,
            minHeight: editableDraft ? 100 : 60,
            borderRadius: 2,
            maxWidth: "100%",
          }}
        >
          <Editor
            readOnly={!editableDraft}
            ref={editor}
            placeholder={
              !cardEditing.isEditing && role !== "ADMIN"
                ? "Описание отсутствует"
                : "Введите описание..."
            }
            handleKeyCommand={handleKeyCommand}
            editorState={editorState}
            customStyleMap={styleMap}
            blockStyleFn={myBlockStyleFn}
            onChange={(editorState) => setEditorState(editorState)}
          />
        </Box>
      </Box>
      {editableDraft && (
        <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
          <Button variant="contained" onClick={handleSaveDescription}>
            Сохранить
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            onClick={() => handleCancelEdit()}
          >
            Отмена
          </Button>
        </Stack>
      )}
    </React.Fragment>
  );
};

export default DraftEditor;
