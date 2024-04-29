import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import boardsRouter from "./routes/boardsRoute.js";
import authRouter from "./routes/authRoute.js";
import listsRouter from "./routes/listsRoute.js";
import cardsRouter from "./routes/cardsRoute.js";
import usersRouter from "./routes/usersRoute.js";
import invitationsRouter from "./routes/invitationsRoute.js";
import path from "path";
import sse from './sse.js'; 
import { fileURLToPath } from "url";

const PORT = 5000;

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("SUCCESSFULLY CONNECTED TO DB");
  })
  .catch((err) => {
    console.log(err.message);
  });

const app = express();




app.use(express.static(path.join(__dirname, "uploads")));
app.use(cors());
app.use(express.json());

app.get('/sse', (req, res, next) => {
  res.flush = () => {};
  next();
}, sse.init);


app.use("/api/auth", authRouter);
app.use("/api/boards", boardsRouter);
app.use("/api/cards", cardsRouter);
app.use("/api/lists", listsRouter);
app.use("/api/users", usersRouter);
app.use("/api/invite", invitationsRouter);

app.listen(PORT, (error) => {
  if (!error) console.log("Server is Running on port " + PORT);
  else console.log("Error occurred, server can't start", error);
});
