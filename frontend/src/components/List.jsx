import { Box, Paper, Stack, Typography } from "@mui/material";
import React from "react";
import { Draggable, Droppable } from "react-beautiful-dnd";
import BoardCard from "./BoardCard";
// import { Draggable } from "@hello-pangea/dnd";

const List = (props) => {
  const { cards } = props;
  // console.log(props);

  return (
    <Draggable draggableId={props._id} index={props.index}>
      {(provided) => (
        <Paper
          elevation={2}
          sx={{ p: 1, minWidth: 250 }}
          ref={provided.innerRef}
          {...provided.draggableProps}
        >
          <Typography
            {...provided.dragHandleProps}
            variant="body2"
            sx={{ fontWeight: 600 }}
          >
            {props.title}
          </Typography>

          <Droppable droppableId={props._id} type="CARD">
            {(provided) => (
              <Stack
                sx={{ mt: 1 }}
                direction={"column"}
                spacing={1}
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {cards.map((card, idx) => (
                  <BoardCard key={card._id} index={idx} {...card} />
                ))}
                {provided.placeholder}
              </Stack>
            )}
          </Droppable>
        </Paper>
      )}
    </Draggable>
  );
};

export default List;
