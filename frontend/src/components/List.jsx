import {
  Box,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { Draggable, Droppable } from "react-beautiful-dnd";
import BoardCard from "./BoardCard";
import { useParams } from "react-router-dom";
import AddElement from "../pages/AddElement";
import EditColumnIcon from "@mui/icons-material/MoreHoriz";
import ListEditModal from "./ListEditModal";

const List = (props) => {
  const { cards, _id: listId, index, title } = props;
  const { handleEditListTitle, cards: c, ...rest } = props;
  const [isCreatingNewCard, setIsCreatingNewCard] = useState(false);

  const [anchorEl, setAnchorEl] = useState(null);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newListTitle, setNewListTitle] = useState(title);
  const { boardId } = useParams();

  const handleTitleClick = () => {
    setIsEditingTitle(true);
  };

  const handleEditTitle = (e) => {
    if (e.type === "keydown" && e.key !== "Enter") return;

    if (!newListTitle) {
      setNewListTitle(title);
      setIsEditingTitle(false);
      return;
    }

    if (newListTitle !== title && newListTitle) {
      handleEditListTitle(listId, index, newListTitle);
    }
    setIsEditingTitle(false);
  };

  return (
    <Draggable draggableId={props._id} index={props.index}>
      {(provided) => (
        <Paper
          elevation={2}
          sx={{
            position: "relative",
            p: 1,
            minWidth: 250,
            bgcolor: "#ededed",
            maxWidth: 300
          }}
          ref={provided.innerRef}
          {...provided.draggableProps}
        >
          <IconButton
            onClick={(e) => setAnchorEl(e.currentTarget)}
            size="small"
            sx={{
              color: "black",
              position: "absolute",
              right: 0,
              top: 0,
              p: 1,
            }}
          >
            <EditColumnIcon />
          </IconButton>
          <ListEditModal
            anchorEl={anchorEl}
            setAnchorEl={setAnchorEl}
            {...props}
          />
          <Box {...provided.dragHandleProps}>
            {isEditingTitle ? (
              <TextField
                value={newListTitle}
                fullWidth
                autoFocus
                size="small"
                onBlur={handleEditTitle}
                onKeyDown={handleEditTitle}
                onChange={(e) => setNewListTitle(e.target.value)}
              />
            ) : (
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, cursor: "pointer" }}
                onClick={handleTitleClick}
              >
                {newListTitle}
              </Typography>
            )}
          </Box>

          <Droppable droppableId={props._id} type="CARD">
            {(provided, sn) => {
              return (
                <Stack
                  sx={{
                    mt: 1,
                    maxHeight: 450,
                    overflow: "auto",
                    p: 0.1,
                    bgcolor: sn.isDraggingOver ? "#bdbdbd" : null,
                    minHeight: sn.isDraggingOver ? 45 : 15,
                    borderRadius: 1,
                  }}
                  direction={"column"}
                  spacing={1}
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {cards.map((card, idx) => (
                    <BoardCard
                      key={card._id}
                      index={idx}
                      listInfo={rest}
                      // listTitle={newListTitle}
                      {...card}
                    />
                  ))}
                  {provided.placeholder}
                </Stack>
              );
            }}
          </Droppable>
          <AddElement
            boardId={boardId}
            listIndex={index}
            listId={listId}
            isCreating={isCreatingNewCard}
            setIsCreating={setIsCreatingNewCard}
            type="CARD"
          />
        </Paper>
      )}
    </Draggable>
  );
};

export default List;
