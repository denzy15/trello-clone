import { Search } from "@mui/icons-material";
import { Box, InputAdornment, TextField } from "@mui/material";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import SearchResults from "./SearchResults";
import axiosInstance from "../axiosInterceptor";
import { SERVER_URL } from "../constants";
import { setBoards } from "../store/slices/boardsSlice";
import { toast } from "react-toastify";

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const [searchResults, setSearchResults] = useState(null);

  const { boards, currentBoard } = useSelector((state) => state.boards);
  const dispatch = useDispatch();

  const handleSearch = async (event) => {
    const searchTerm = event.target.value.toLowerCase();
    if (!event.target.value) {
      setSearchResults(null);
      return;
    }

    if (!!currentBoard && (!boards || !boards.length)) {
      await axiosInstance
        .get(`${SERVER_URL}/api/boards`)
        .then(({ data }) => {
          dispatch(setBoards(data));
          filterResults(searchTerm, data);
        })
        .catch((e) =>
          toast.error(
            e.response.data.message ||
              "Не удалось загрузить информацию о досках"
          )
        );
    } else {
      filterResults(searchTerm, boards);
    }
  };

  const filterResults = (searchTerm, boards) => {
    const filteredResults = [];
    boards.forEach((board) => {
      const lowerBoardTitle = board.title.toLowerCase();

      if (lowerBoardTitle.includes(searchTerm)) {
        filteredResults.push({
          type: "board",
          _id: board._id,
          title: board.title,
        });
      }

      board.lists.forEach((list) => {
        const lowerListTitle = list.title.toLowerCase();
        if (lowerListTitle.includes(searchTerm)) {
          filteredResults.push({
            type: "list",
            _id: list._id,
            title: list.title,
            boardId: board._id,
            boardTitle: board.title,
          });
        }

        list.cards.forEach((card) => {
          const lowerCardTitle = card.title.toLowerCase();

          if (lowerCardTitle.includes(searchTerm)) {
            filteredResults.push({
              type: "card",
              _id: card._id,
              title: card.title,
              boardId: board._id,
              boardTitle: board.title,
            });
          }
        });
      });

      setSearchResults(filteredResults);
    });
  };

  const handleClickAway = () => {
    setSearchResults(null);
  };

  return (
    <Box sx={{ position: "relative" }}>
      <TextField
        autoComplete="off"
        id="search-field"
        fullWidth
        label="Поиск..."
        type="search"
        variant="standard"
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Search />
            </InputAdornment>
          ),
        }}
        onInput={(event) => handleSearch(event)}
      />
      {!!searchQuery && (
        <SearchResults
          handleClickAway={handleClickAway}
          results={searchResults}
        />
      )}
    </Box>
  );
};

export default SearchBar;
