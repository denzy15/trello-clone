import React, { useEffect, useRef, useState } from "react";
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
import { updateCardDescription } from "../../store/slices/metadataSlice";
import axiosInstance from "../../axiosInterceptor";
import { SERVER_URL } from "../../constants";
import { toast } from "react-toastify";
import { updateCard } from "../../store/slices/boardsSlice";

const DraftEditor = ({ closeModal }) => {
  const { cardEditing } = useSelector((state) => state.metadata);
  const { currentBoard } = useSelector((state) => state.boards);

  const dispatch = useDispatch();

  const createEditorState = () => {
    if (!cardEditing.card.description) {
      return EditorState.createEmpty();
    }

    const contentState = convertFromRaw(
      JSON.parse(cardEditing.card.description)
    );
    const newEditorState = EditorState.createWithContent(contentState);

    return newEditorState;
  };

  const [editorState, setEditorState] = useState(createEditorState());
  const editor = useRef(null);

  useEffect(() => {
    focusEditor();
  }, []);

  const focusEditor = () => {
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

  // FOR INLINE STYLES
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

  // FOR BLOCK LEVEL STYLES(Returns CSS Class From DraftEditor.css)
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

  // const handleSaveDescription = async () => {
  //   const contentState = editorState.getCurrentContent();
  //   const contentRaw = convertToRaw(contentState);
  //   const contentString = JSON.stringify(contentRaw);

  //   await axiosInstance
  //     .put(
  //       `${SERVER_URL}/api/cards/${currentBoard._id}/${cardEditing.card._id}`,
  //       { description: contentString }
  //     )
  //     .then(async () => {
  //       dispatch(updateCardDescription(contentString));
  //       await axiosInstance
  //         .get(
  //           `${SERVER_URL}/api/cards/${currentBoard._id}/${cardEditing.card._id}`
  //         )
  //         .then(({ data }) => {
  //           dispatch(
  //             updateCard({
  //               listIndex: cardEditing.card.listInfo.index,
  //               cardIndex: cardEditing.card.index,
  //               card: data,
  //             })
  //           );
  //         });
  //     })
  //     .catch((e) => {
  //       toast.error("Не удалось обновить описание, попробуйте позже");
  //     })
  //     .finally(() => {
  //       closeModal();
  //     });
  // };

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
    } catch (error) {
      throw new Error("Failed to update card description");
    }
  };

  const handleSaveDescription = async () => {
    const contentState = editorState.getCurrentContent();
    const contentRaw = convertToRaw(contentState);
    const contentString = JSON.stringify(contentRaw);

    try {
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
    } catch (error) {
      toast.error("Не удалось обновить описание, попробуйте позже");
    } finally {
      closeModal();
    }
  };

  const handleCancelEdit = () => {
    setEditorState(createEditorState());
    closeModal();
  };

  return (
    <Box className="editor-wrapper" onClick={focusEditor}>
      <Toolbar editorState={editorState} setEditorState={setEditorState} />
      <Divider sx={{ my: 1 }} color="black" />
      <Box className="editor-container">
        <Editor
          ref={editor}
          placeholder="Введите описание..."
          handleKeyCommand={handleKeyCommand}
          editorState={editorState}
          customStyleMap={styleMap}
          blockStyleFn={myBlockStyleFn}
          onChange={(editorState) => {
            setEditorState(editorState);
          }}
        />
      </Box>
      <Stack direction={"row"} spacing={2} sx={{ mt: 1 }}>
        <Button variant="contained" onClick={handleSaveDescription}>
          Сохранить
        </Button>
        <Button variant="outlined" color="inherit" onClick={handleCancelEdit}>
          Отмена
        </Button>
      </Stack>
    </Box>
  );
};

export default DraftEditor;
