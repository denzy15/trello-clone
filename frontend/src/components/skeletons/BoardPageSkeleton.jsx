import { Skeleton, Stack } from "@mui/material";
import React from "react";

const BoardPageSkeleton = () => {
  return (
    <Stack spacing={2} sx={{ pb: 50 }} direction={"row"}>
      <Stack spacing={1}>
        <Skeleton variant="text" sx={{ fontSize: "1.5rem" }} />
        <Skeleton variant="rounded" width={300} height={50} />
        <Skeleton variant="rounded" width={300} height={50} />
      </Stack>
      <Stack spacing={1}>
        <Skeleton variant="text" sx={{ fontSize: "1.5rem" }} />
        <Skeleton variant="rounded" width={300} height={50} />
        <Skeleton variant="rounded" width={300} height={50} />
      </Stack>
      <Stack spacing={1}>
        <Skeleton variant="text" sx={{ fontSize: "1.5rem" }} />
        <Skeleton variant="rounded" width={300} height={50} />
        <Skeleton variant="rounded" width={300} height={50} />
      </Stack>
    </Stack>
  );
};

export default BoardPageSkeleton;
