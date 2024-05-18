import { Alert, Backdrop, Box, Stack } from "@mui/material";
import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useParams } from "react-router-dom";
import { SERVER_URL } from "../constants";
import axiosInstance from "../axiosInterceptor";
import List from "../components/List";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import BoardInfoBar from "../components/BoardInfoBar";
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
import AddElement from "../components/AddElement";
import BoardPageSkeleton from "../components/skeletons/BoardPageSkeleton";

const BoardPage = () => {
  // Получение параметра из URL
  const { boardId } = useParams();

  // Хуки для управления состоянием компонента
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCreatingNewList, setIsCreatingNewList] = useState(false);

  // Получение данных о пользователе и доске из Redux store
  const { _id: currentUserId } = useSelector((state) => state.auth);
  const { cardEditing } = useSelector((state) => state.metadata);
  const { currentBoard } = useSelector((state) => state.boards);

  // Инициализация диспатча для обновления Redux store
  const dispatch = useDispatch();

  // Загрузка данных о доске при монтировании компонента
  useEffect(() => {
    async function fetchBoardInfo() {
      setLoading(true);
      try {
        const { data } = await axiosInstance.get(
          `${SERVER_URL}/api/boards/${boardId}`
        );
        dispatch(pickBoard(data));
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Ошибка загрузки доски. Попробуйте снова позже."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchBoardInfo();
  }, [boardId, dispatch]);

  // Определение роли пользователя на доске при изменении данных о доске
  useEffect(() => {
    const calculateRole = () => {
      if (currentUserId === currentBoard.creator._id) {
        return "ADMIN";
      }

      for (const user of currentBoard.users) {
        if (user._id === currentUserId) {
          return user.role;
        }
      }
    };

    if (!!currentBoard.creator) {
      dispatch(setMyRoleOnCurrentBoard(calculateRole()));
    }
  }, [currentBoard, currentUserId, dispatch]);

  // Обработчик изменения названия списка
  const handleEditListTitle = async (listId, listIndex, newListTitle) => {
    const oldListTitle = currentBoard.lists[listIndex].title;
    dispatch(renameList({ listIndex, title: newListTitle }));

    try {
      await axiosInstance.put(
        `${SERVER_URL}/api/lists/${boardId}/rename/${listId}`,
        {
          title: newListTitle,
        }
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Не удалось переименовать список. Попробуйте снова позже."
      );
      dispatch(renameList({ listIndex, title: oldListTitle }));
    }
  };

  // Обработчик завершения перетаскивания элемента

  const onDragEnd = async (result) => {
    const { destination, source, draggableId, type } = result;
    // Если нет пункта назначения, выходим
    if (!destination) {
      return;
    }

    // Если элемент бросили в ту же позицию, выходим
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Если перетаскиваемый элемент - колонка
    if (type === "COLUMN") {
      // Клонируем списки текущей доски
      const oldOrderedLists = Array.from(currentBoard.lists);
      const newOrderedLists = Array.from(currentBoard.lists);

      // Удаляем перетаскиваемую колонку из исходного местоположения
      const [targetList] = newOrderedLists.splice(source.index, 1);

      // Вставляем перетаскиваемую колонку в позицию назначения
      newOrderedLists.splice(destination.index, 0, targetList);

      // Обновляем хранилище новым порядком колонок
      dispatch(updateListOrder(newOrderedLists));

      try {
        // Пытаемся обновить порядок колонок на сервере
        await axiosInstance.put(
          `${SERVER_URL}/api/lists/${currentBoard._id}/move/${draggableId}?newOrder=${destination.index}`
        );
      } catch (error) {
        // Обрабатываем ошибки и возвращаем старый порядок колонок
        setError("Произошла ошибка. Не удалось изменить порядок колонок");
        dispatch(updateListOrder(oldOrderedLists));
        setTimeout(() => {
          setError("");
        }, 3000);
      }

      return;
    }

    // Находим индексы исходного и целевого списка
    const sourceListIndex = currentBoard.lists.findIndex(
      (list) => list._id === source.droppableId
    );
    const resultListIndex = currentBoard.lists.findIndex(
      (list) => list._id === destination.droppableId
    );

    // Если индексы исходного или целевого списка не найдены
    if (sourceListIndex === -1 || resultListIndex === -1) {
      setError("Ошибка перетаскивания. Пожалуйста, попробуйте еще раз.");
      return;
    }

    // Если исходный и целевой списки совпадают
    if (sourceListIndex !== -1 && sourceListIndex === resultListIndex) {
      // Клонируем текущие карточки исходного списка
      const oldOrderedCards = Array.from(
        currentBoard.lists[sourceListIndex].cards
      );
      const newOrderedCards = Array.from(
        currentBoard.lists[sourceListIndex].cards
      );

      // Удаляем перетаскиваемую карточку из исходной позиции
      const [targetCard] = newOrderedCards.splice(source.index, 1);

      // Вставляем перетаскиваемую карточку на позицию назначения
      newOrderedCards.splice(destination.index, 0, targetCard);

      // Обновляем хранилище новым порядком карточек
      dispatch(
        updateCardOrder({ listIndex: sourceListIndex, cards: newOrderedCards })
      );

      try {
        // Пытаемся обновить порядок карточек на сервере
        await axiosInstance.put(
          `${SERVER_URL}/api/cards/${boardId}/${draggableId}/change-order?listId=${source.droppableId}`,
          { newOrder: destination.index }
        );
      } catch (error) {
        // Обрабатываем ошибки и возвращаем старый порядок карточек
        dispatch(
          updateCardOrder({
            listIndex: sourceListIndex,
            cards: oldOrderedCards,
          })
        );
      }

      return;
    }

    // Клонируем текущие карточки исходного и целевого списков
    const newOrderedSourceCards = Array.from(
      currentBoard.lists[sourceListIndex].cards
    );
    const newOrderedDestinationCards = Array.from(
      currentBoard.lists[resultListIndex].cards
    );

    // Удаляем перетаскиваемую карточку из исходного списка и вставляем в целевой список

    const [targetCard] = newOrderedSourceCards.splice(source.index, 1);
    newOrderedDestinationCards.splice(destination.index, 0, targetCard);

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
      <Box
        sx={{
          background: `url('${SERVER_URL}/${currentBoard.currentBackground}')`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          minHeight: "100%",
        }}
      >
        <Navbar />
        <BoardInfoBar title={currentBoard.title} />
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
              <BoardPageSkeleton />
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
