import { Alert, Box, Container, Stack } from "@mui/material";
import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useParams } from "react-router-dom";
import { SERVER_URL } from "../constants";
import axiosInstance from "../axiosInterceptor";
import GridLoader from "react-spinners/GridLoader";
import List from "../components/List";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import BoardInfoBar from "../components/BoardInfoBar";

const BoardPage = () => {
  const { boardId } = useParams();
  const [loading, setLoading] = useState(false);

  const [currentBoard, setCurrentBoard] = useState({});
  const [error, setError] = useState("");

  const [orderedLists, setOrderedLists] = useState([]);

  useEffect(() => {
    async function fetchBoardInfo() {
      setLoading(true);
      await axiosInstance
        .get(`${SERVER_URL}/api/boards/${boardId}`)
        .then(({ data }) => {
          setCurrentBoard(data);
          setOrderedLists(data.lists);
        })
        .finally(() => {
          setLoading(false);
        });
    }

    fetchBoardInfo();
  }, []);

  const onDragEnd = async (result) => {
    console.log(result);
    const { destination, source, draggableId, type } = result;
    if (!destination) {
      return;
    }
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    if (type === "COLUMN") {
      const oldOrderedLists = Array.from(orderedLists);
      const newOrderedLists = Array.from(orderedLists);

      const [targetList] = newOrderedLists.splice(source.index, 1);
      newOrderedLists.splice(destination.index, 0, targetList);

      setOrderedLists(newOrderedLists);
      await axiosInstance
        .put(
          `${SERVER_URL}/api/lists/${currentBoard._id}/move/${draggableId}?newOrder=${destination.index}`
        )
        .catch(() => {
          setError("Ошибка. Не удалось поменять местами списки");
          setOrderedLists(oldOrderedLists);
          setTimeout(() => {
            setError("");
          }, 3000);
        });

      return;
    }

    // debugger;
    const sourceListIndex = orderedLists.findIndex(
      (list) => list._id === source.droppableId
    );
    const resultListIndex = orderedLists.findIndex(
      (list) => list._id === destination.droppableId
    );

    if (sourceListIndex === -1 || resultListIndex === -1) {
      setError("Ошибка перетаскивания. Повторите еще раз");
      return;
    }

    if (sourceListIndex !== -1 && sourceListIndex === resultListIndex) {
      const oldOrderedCards = Array.from(orderedLists[sourceListIndex].cards);
      const newOrderedCards = Array.from(orderedLists[sourceListIndex].cards);

      const [targetCard] = newOrderedCards.splice(source.index, 1);
      newOrderedCards.splice(destination.index, 0, targetCard);
      setOrderedLists((prev) => {
        const updatedLists = [...prev];
        updatedLists[sourceListIndex] = {
          ...updatedLists[sourceListIndex],
          cards: newOrderedCards,
        };
        return updatedLists;
      });

      await axiosInstance
        .put(
          `${SERVER_URL}/api/cards/${boardId}/${draggableId}/change-order?listId=${source.droppableId}`,
          { newOrder: destination.index }
        )
        .catch(() => {
          setOrderedLists((prev) => {
            const updatedLists = [...prev];
            updatedLists[sourceListIndex] = {
              ...updatedLists[sourceListIndex],
              cards: oldOrderedCards,
            };
            return updatedLists;
          });
        });
      return;
    }

    const newOrderedSourceCards = Array.from(
      orderedLists[sourceListIndex].cards
    );

    const newOrderedDestinationCards = Array.from(
      orderedLists[resultListIndex].cards
    );

    const [targetCard] = newOrderedSourceCards.splice(source.index, 1);
    newOrderedDestinationCards.splice(destination.index, 0, targetCard);

    setOrderedLists((prev) => {
      const lists = [...prev];
      lists[sourceListIndex] = {
        ...lists[sourceListIndex],
        cards: newOrderedSourceCards,
      };
      lists[resultListIndex] = {
        ...lists[resultListIndex],
        cards: newOrderedDestinationCards,
      };
      return lists;
    });
  };

  return (
    <Box>
      <Navbar />
      <BoardInfoBar {...currentBoard} />
      <Container>
        {!!error && (
          <Alert severity="error" sx={{ my: 3 }}>
            {error}
          </Alert>
        )}
        {loading ? (
          <Box sx={{ textAlign: "center", mt: 4 }}>
            <GridLoader color="#875ceb" size={30} />
          </Box>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable
              droppableId={boardId}
              key={boardId}
              type="COLUMN"
              direction="horizontal"
            >
              {(provided) => (
                <Stack
                  sx={{ mt: 2 }}
                  direction={"row"}
                  spacing={2}
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {orderedLists &&
                    orderedLists.map((list, idx) => {
                      // debugger;
                      return <List key={list._id} index={idx} {...list} />;
                    })}
                  {provided.placeholder}
                </Stack>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </Container>
    </Box>
  );
};

export default BoardPage;
