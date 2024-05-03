import { Paper, Typography, List, ClickAwayListener, Box } from "@mui/material";
import SearchResultItem from "./SearchResultItem";
import GridLoader from "react-spinners/GridLoader";

const SearchResults = ({ results, handleClickAway }) => {
  // if (!results) return null;

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Paper
        elevation={3}
        sx={{
          padding: 2,
          position: "absolute",
          zIndex: 1000,
          overflow: "auto",
          textOverflow: "ellipsis",
          right: 0,
          top: 50,
          minWidth: "30vw",
          maxWidth: { sm: "90vw", md: "50vw" },
          maxHeight: "70vh",
        }}
      >
        <Typography variant="h6" gutterBottom>
          Результаты поиска
        </Typography>
        {!results ? (
          <GridLoader color="#875ceb" size={10} />
        ) : (
          <>
            <List disablePadding>
              {results.map((result) => (
                <SearchResultItem
                  handleClickAway={handleClickAway}
                  {...result}
                  key={result._id}
                />
              ))}
            </List>
            {!results.length && (
              <Typography variant="body1">
                По вашему запросу ничего не найдено.
              </Typography>
            )}
          </>
        )}
      </Paper>
    </ClickAwayListener>
  );
};

export default SearchResults;
