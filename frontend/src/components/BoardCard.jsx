import { Box, Paper } from "@mui/material";
import React from "react";
import { Draggable } from "react-beautiful-dnd";

const BoardCard = (props) => {
  return (
    <Draggable draggableId={props._id} index={props.index}>
      {(provided) => (
        <Paper
          elevation={1}
          sx={{ p: 1, }}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <Box>{props.title}</Box>
          {props.order}
        </Paper>
      )}
    </Draggable>
  );
};

export default BoardCard;
