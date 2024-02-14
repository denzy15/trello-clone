export const toolbarOptions = {
  options: [
    "inline",
    "blockType",
    "list",
    "textAlign",
    "link",
    "embedded",
    "emoji",
    "remove",
    "history",
  ],
  inline: { options: ["bold", "italic", "underline", "strikethrough"] },
  blockType: {
    options: [
      "Normal",
      "H1",
      "H2",
      "H3",
      "H4",
      "H5",
      "H6",
      "Blockquote",
      "Code",
    ],
  },
  list: { options: ["unordered", "ordered"] },
  textAlign: { options: ["left", "center", "right"] },
  link: { options: ["link"] },
  embedded: { options: ["embedded"] },
  emoji: { options: ["emoji"] },
  remove: { options: ["remove"] },
  history: { options: ["undo", "redo"] },
};