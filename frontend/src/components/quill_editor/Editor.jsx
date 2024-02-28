import { Box, Button } from "@mui/material";
import { useState } from "react";
import ReactQuill from "react-quill";

function Editor() {
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [{ align: ["right", "center", "justify"] }],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link"],
      //   ["link", "image"],
    ],
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "link",
    // "image",
    "align",
  ];

  const [code, setCode] = useState("");
  const handleProcedureContentChange = (content, delta, source, editor) => {
    console.log(delta);
    setCode(content);
    //let has_attribues = delta.ops[1].attributes || "";
    //console.log(has_attribues);
    //const cursorPosition = e.quill.getSelection().index;
    // this.quill.insertText(cursorPosition, "★");
    //this.quill.setSelection(cursorPosition + 1);
  };

  return (
    <>
      {console.log(code)}
      <ReactQuill
        theme="snow"
        modules={modules}
        formats={formats}
        value={code}
        readOnly
        onChange={handleProcedureContentChange}
      />
      <Button>Сохранить</Button>
      <Box></Box>
    </>
  );
}

export default Editor;
