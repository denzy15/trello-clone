import { Alert, Backdrop, Box, Button, Container, Stack } from "@mui/material";
import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useParams } from "react-router-dom";
import { SERVER_URL } from "../constants";
import axiosInstance from "../axiosInterceptor";
import GridLoader from "react-spinners/GridLoader";
import List from "../components/List";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import BoardInfoBar from "../components/BoardInfoBar";
import AddElement from "./AddElement";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import CardEditModal from "../components/CardEditModal";
import {
  setMyRoleOnCurrentBoard,
  stopCardEdit,
} from "../store/slices/metadataSlice";
import {
  pickBoard,
  renameList,
  updateCardOrder,
  updateListOrder,
} from "../store/slices/boardsSlice";
import { LocalizationProvider, ruRU } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

const BoardPage = () => {
  const { boardId } = useParams();
  const [loading, setLoading] = useState(false);

  const { _id: currentUserId } = useSelector((state) => state.auth);

  const [error, setError] = useState("");

  const [isCreatingNewList, setIsCreatingNewList] = useState(false);

  const { cardEditing } = useSelector((state) => state.metadata);
  const { currentBoard } = useSelector((state) => state.boards);

  const dispatch = useDispatch();

  useEffect(() => {
    async function fetchBoardInfo() {
      setLoading(true);
      await axiosInstance
        .get(`${SERVER_URL}/api/boards/${boardId}`)
        .then(({ data }) => {
          dispatch(pickBoard(data));

          // setOrderedLists(data.lists);
        })
        .finally(() => {
          setLoading(false);
        });
    }

    fetchBoardInfo();
  }, []);

  useEffect(() => {
    const calculateRole = () => {
      if (currentUserId === currentBoard.creator._id) {
        return "ADMIN";
      }

      for (const user of currentBoard.users) {
        if (user.userId._id === currentUserId) {
          return user.role;
        }
      }
    };

    if (!!currentBoard.creator) {
      dispatch(setMyRoleOnCurrentBoard(calculateRole()));
    }
  }, [boardId, currentBoard, currentBoard.users, currentUserId, dispatch]);

  const handleEditListTitle = async (listId, listIndex, newListTitle) => {
    const oldListTitle = currentBoard.lists[listIndex].title;

    // setOrderedLists((prev) => {
    //   const updatedLists = [...prev];
    //   updatedLists[listIndex] = {
    //     ...updatedLists[listIndex],
    //     title: newListTitle,
    //   };
    //   return updatedLists;
    // });
    dispatch(renameList({ listIndex, title: newListTitle }));

    await axiosInstance
      .put(`${SERVER_URL}/api/lists/${boardId}/rename/${listId}`, {
        title: newListTitle,
      })
      .catch(() => {
        toast.error("Не удалось переименовать список, попробуйте позже");
        dispatch(renameList({ listIndex, title: oldListTitle }));
      });
  };

  const onDragEnd = async (result) => {
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
      const oldOrderedLists = Array.from(currentBoard.lists);
      const newOrderedLists = Array.from(currentBoard.lists);

      const [targetList] = newOrderedLists.splice(source.index, 1);
      newOrderedLists.splice(destination.index, 0, targetList);
      dispatch(updateListOrder(newOrderedLists));
      await axiosInstance
        .put(
          `${SERVER_URL}/api/lists/${currentBoard._id}/move/${draggableId}?newOrder=${destination.index}`
        )
        .catch(() => {
          setError("Ошибка. Не удалось поменять местами списки");
          dispatch(updateListOrder(oldOrderedLists));
          setTimeout(() => {
            setError("");
          }, 3000);
        });

      return;
    }

    const sourceListIndex = currentBoard.lists.findIndex(
      (list) => list._id === source.droppableId
    );
    const resultListIndex = currentBoard.lists.findIndex(
      (list) => list._id === destination.droppableId
    );

    if (sourceListIndex === -1 || resultListIndex === -1) {
      setError("Ошибка перетаскивания. Повторите еще раз");
      return;
    }

    if (sourceListIndex !== -1 && sourceListIndex === resultListIndex) {
      const oldOrderedCards = Array.from(
        currentBoard.lists[sourceListIndex].cards
      );
      const newOrderedCards = Array.from(
        currentBoard.lists[sourceListIndex].cards
      );

      const [targetCard] = newOrderedCards.splice(source.index, 1);
      newOrderedCards.splice(destination.index, 0, targetCard);
      dispatch(
        updateCardOrder({ listIndex: sourceListIndex, cards: newOrderedCards })
      );

      await axiosInstance
        .put(
          `${SERVER_URL}/api/cards/${boardId}/${draggableId}/change-order?listId=${source.droppableId}`,
          { newOrder: destination.index }
        )
        .catch(() => {
          dispatch(
            updateCardOrder({
              listIndex: sourceListIndex,
              cards: oldOrderedCards,
            })
          );
        });
      return;
    }

    const newOrderedSourceCards = Array.from(
      currentBoard.lists[sourceListIndex].cards
    );

    const newOrderedDestinationCards = Array.from(
      currentBoard.lists[resultListIndex].cards
    );

    const [targetCard] = newOrderedSourceCards.splice(source.index, 1);
    newOrderedDestinationCards.splice(destination.index, 0, targetCard);

    // setOrderedLists((prev) => {
    //   const lists = [...prev];
    //   lists[sourceListIndex] = {
    //     ...lists[sourceListIndex],
    //     cards: newOrderedSourceCards,
    //   };
    //   lists[resultListIndex] = {
    //     ...lists[resultListIndex],
    //     cards: newOrderedDestinationCards,
    //   };
    //   return lists;
    // });
    dispatch(
      updateCardOrder({
        listIndex: sourceListIndex,
        cards: newOrderedSourceCards,
      })
    );
    dispatch(
      updateCardOrder({
        listIndex: resultListIndex,
        cards: newOrderedDestinationCards,
      })
    );

    await axiosInstance
      .put(`${SERVER_URL}/api/cards/${boardId}/${draggableId}/move`, {
        from: source.droppableId,
        to: destination.droppableId,
        newOrder: destination.index,
      })
      .catch(() => {
        // setOrderedLists((prev) => {
        //   const lists = [...prev];
        //   newOrderedSourceCards.splice(source.index, 0, targetCard);
        //   lists[sourceListIndex] = {
        //     ...lists[sourceListIndex],
        //     cards: newOrderedSourceCards,
        //   };
        //   newOrderedDestinationCards.splice(destination.index, 1);
        //   lists[resultListIndex] = {
        //     ...lists[resultListIndex],
        //     cards: newOrderedDestinationCards,
        //   };
        //   return lists;
        // });

        newOrderedDestinationCards.splice(destination.index, 1);
        newOrderedSourceCards.splice(source.index, 0, targetCard);
        dispatch(
          updateCardOrder({
            listIndex: sourceListIndex,
            cards: newOrderedSourceCards,
          })
        );
        dispatch(
          updateCardOrder({
            listIndex: resultListIndex,
            cards: newOrderedDestinationCards,
          })
        );
      });
  };

  return (
    <LocalizationProvider
      dateAdapter={AdapterDayjs}
      adapterLocale="ru"
      localeText={
        ruRU.components.MuiLocalizationProvider.defaultProps.localeText
      }
    >
      <Box>
        <Navbar />
        <BoardInfoBar {...currentBoard} />
        <Box
          sx={{
            px: 1,
            height: "100%",
          }}
        >
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
            <Box>
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable
                  droppableId={boardId}
                  key={boardId}
                  type="COLUMN"
                  direction="horizontal"
                >
                  {(provided) => (
                    <Stack
                      sx={{ mt: 2, overflow: "auto", pb: 1, minHeight: "83vh" }}
                      direction={"row"}
                      alignItems={"start"}
                      spacing={2}
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      {currentBoard &&
                        currentBoard.lists &&
                        currentBoard.lists.map((list, idx) => (
                          <List
                            key={list._id}
                            index={idx}
                            handleEditListTitle={handleEditListTitle}
                            {...list}
                          />
                        ))}
                      {provided.placeholder}

                      <AddElement
                        boardId={boardId}
                        isCreating={isCreatingNewList}
                        setIsCreating={setIsCreatingNewList}
                        type="LIST"
                      />
                    </Stack>
                  )}
                </Droppable>
              </DragDropContext>
              {cardEditing.isEditing && (
                <Backdrop
                  sx={{
                    color: "#fff",
                    zIndex: 5,
                    overflowY: "auto",
                  }}
                  open={cardEditing.isEditing}
                  onClick={() => dispatch(stopCardEdit())}
                >
                  <CardEditModal
                    key={1}
                    isOpen={cardEditing.isEditing}
                    close={() => dispatch(stopCardEdit())}
                  />
                </Backdrop>
              )}
            </Box>
          )}
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default BoardPage;
