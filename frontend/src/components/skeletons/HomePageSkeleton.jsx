import { Skeleton, Stack } from "@mui/material";
import React from "react";

const HomePageSkeleton = () => {
  return (
    <Stack spacing={2} direction={"row"}>
      <Skeleton animation="wave" variant="rounded" width={180} height={80} />
      <Skeleton animation="wave" variant="rounded" width={180} height={80} />
      <Skeleton animation="wave" variant="rounded" width={180} height={80} />
    </Stack>
  );
};

export default HomePageSkeleton;
