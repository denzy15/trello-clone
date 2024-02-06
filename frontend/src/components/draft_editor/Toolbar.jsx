import React from "react";
import { RichUtils } from "draft-js";
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  BorderColor,
  FormatStrikethrough,
  FormatQuote,
  FormatListBulleted,
  FormatListNumbered,
  Code,
  FormatAlignLeft,
  FormatAlignCenter,
  FormatAlignRight,
} from "@mui/icons-material";
import { Box, Button, Divider } from "@mui/material";

const Toolbar = ({ editorState, setEditorState }) => {
  const tools = [
    {
      label: "bold",
      style: "BOLD",
      icon: <FormatBold />,
      method: "inline",
    },
    {
      label: "italic",
      style: "ITALIC",
      icon: <FormatItalic />,
      method: "inline",
    },
    {
      label: "underline",
      style: "UNDERLINE",
      icon: <FormatUnderlined />,
      method: "inline",
    },
    {
      label: "highlight",
      style: "HIGHLIGHT",
      icon: <BorderColor />,
      method: "inline",
    },
    {
      label: "strike-through",
      style: "STRIKETHROUGH",
      icon: <FormatStrikethrough />,
      method: "inline",
    },
    {
      label: "Blockquote",
      style: "blockQuote",
      icon: <FormatQuote />,
      method: "block",
    },
    {
      label: "Unordered-List",
      style: "unordered-list-item",
      method: "block",
      icon: <FormatListBulleted />,
    },
    {
      label: "Ordered-List",
      style: "ordered-list-item",
      method: "block",
      icon: <FormatListNumbered />,
    },
    {
      label: "Code Block",
      style: "CODEBLOCK",
      icon: <Code />,
      method: "inline",
    },
    // {
    //   label: "Left",
    //   style: "leftAlign",
    //   icon: <FormatAlignLeft />,
    //   method: "block",
    // },
    // {
    //   label: "Center",
    //   style: "centerAlign",
    //   icon: <FormatAlignCenter />,
    //   method: "block",
    // },
    // {
    //   label: "Right",
    //   style: "rightAlign",
    //   icon: <FormatAlignRight />,
    //   method: "block",
    // },
    { label: "Заголовок 1", style: "header-one", method: "block" },
    { label: "Заголовок 2", style: "header-two", method: "block" },
    { label: "Заголовок 3", style: "header-three", method: "block" },
    { label: "Заголовок 4", style: "header-four", method: "block" },
    { label: "Заголовок 5", style: "header-five", method: "block" },
    { label: "Заголовок 6", style: "header-six", method: "block" },
  ];

  const applyStyle = (e, style, method) => {
    e.preventDefault();
    method === "block"
      ? setEditorState(RichUtils.toggleBlockType(editorState, style))
      : setEditorState(RichUtils.toggleInlineStyle(editorState, style));
  };

  const isActive = (style, method) => {
    if (method === "block") {
      const selection = editorState.getSelection();
      const blockType = editorState
        .getCurrentContent()
        .getBlockForKey(selection.getStartKey())
        .getType();
      return blockType === style;
    } else {
      const currentStyle = editorState.getCurrentInlineStyle();
      return currentStyle.has(style);
    }
  };

  return (
    <Box className="toolbar-grid">
      {tools.map((item, idx) => (
        <Button
          sx={{
            color: isActive(item.style, item.method)
              ? "rgba(0, 0, 0, 1)"
              : "rgba(0, 0, 0, 0.3)",
          }}
          key={`${item.label}-${idx}`}
          title={item.label}
          onClick={(e) => applyStyle(e, item.style, item.method)}
          onMouseDown={(e) => e.preventDefault()}
        >
          {item.icon || item.label}
        </Button>
      ))}
     
    </Box>
  );
};

export default Toolbar;
