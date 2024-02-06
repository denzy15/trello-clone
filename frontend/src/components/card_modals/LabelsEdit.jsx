import { Box, Button, Divider, List, Paper } from "@mui/material";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import LabelListItem from "../LabelListItem";
import axiosInstance from "../../axiosInterceptor";
import { SERVER_URL } from "../../constants";
import { toast } from "react-toastify";
import {
  addLabelToCard,
  removeLabelFromCard,
} from "../../store/slices/metadataSlice";
import LabelEditor from "../LabelEditor";
import { useSearchParams } from "react-router-dom";
import { changeCardLabels } from "../../store/slices/boardsSlice";

const LabelsEdit = ({ closeModal }) => {
  const dispatch = useDispatch();

  const [searchParams, setSearchParams] = useSearchParams();

  const { currentBoard } = useSelector((state) => state.boards);
  const { cardEditing } = useSelector((state) => state.metadata);

  const isAssigned = (labelId) => {
    return cardEditing.card.labels.some((l) => l._id === labelId);
  };

  const [fetchLabelRequest, setFetchLabelRequest] = useState({
    loading: false,
    labelId: "",
  });

  const [labelEditorModal, setLabelEditorModal] = useState(false);

  const handleAssignLabel = async (label) => {
    setFetchLabelRequest({
      loading: true,
      labelId: label._id,
    });

    try {
      const type = isAssigned(label._id) ? "remove" : "add";
      const labels =
        type === "add"
          ? [...cardEditing.card.labels, label]
          : cardEditing.card.labels.filter((l) => l._id !== label._id);
      await axiosInstance.put(
        `${SERVER_URL}/api/cards/${currentBoard._id}/${cardEditing.card._id}`,
        { labels }
      );
      dispatch(
        type === "add" ? addLabelToCard(label) : removeLabelFromCard(label)
      );
      dispatch(
        changeCardLabels({
          listIndex: cardEditing.card.listInfo.index,
          cardIndex: cardEditing.card.index,
          labels,
        })
      );
    } catch (error) {
      toast.error("Не удалось изменить список меток");
    } finally {
      setFetchLabelRequest({
        loading: false,
        labelId: "",
      });
    }
  };

  return (
    <Box sx={{ px: 2, pb: 3 }}>
      <List sx={{ maxHeight: 300, overflowY: "auto", maxWidth: "30vw" }}>
        {currentBoard.labels.map((lbl, idx) => (
          <LabelListItem
            key={idx}
            label={lbl}
            checked={isAssigned(lbl._id)}
            disabled={
              fetchLabelRequest.loading && fetchLabelRequest.labelId === lbl._id
            }
            handleAssignLabel={handleAssignLabel}
            startEdit={() => setLabelEditorModal(true)}
          />
        ))}
      </List>
      <Divider color="gray" sx={{ mb: 2 }} />
      <Button
        variant="contained"
        sx={{
          bgcolor: "#f6f6f6",
          color: "black",
          "&:hover": {
            bgcolor: "#bdbdbd",
          },
        }}
        fullWidth
        onClick={() => {
          setSearchParams({ labelId: "newLabel" });
          setLabelEditorModal(true);
        }}
      >
        Создать новую метку
      </Button>
      {labelEditorModal && (
        <LabelEditor
          close={() => {
            setSearchParams({});
            closeModal();
          }}
          back={() => {
            setSearchParams({});
            setLabelEditorModal(false);
          }}
        />
      )}
    </Box>
  );
};

export default LabelsEdit;
