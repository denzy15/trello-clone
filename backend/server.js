import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from 'cors'
import boardsRouter from "./routes/boardsRoute.js";
import authRouter from "./routes/authRoute.js";
import listsRouter from "./routes/listsRoute.js";
import cardsRouter from "./routes/cardsRoute.js";
import usersRouter from "./routes/usersRoute.js";

const PORT = 5000;

dotenv.config();

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("SUCCESSFULLY CONNECTED TO DB");
  })
  .catch((err) => {
    console.log(err.message);
  });

const app = express();
app.use(cors())
app.use(express.json());
app.use("/api/auth", authRouter);
app.use("/api/boards", boardsRouter);
app.use("/api/cards", cardsRouter);
app.use("/api/lists", listsRouter);
app.use("/api/users", usersRouter);

app.listen(PORT, (error) => {
  if (!error) console.log("Server is Running on port " + PORT);
  else console.log("Error occurred, server can't start", error);
});
