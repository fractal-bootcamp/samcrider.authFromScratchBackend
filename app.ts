import express from "express";
import cors from "cors";
import cookieSession from "cookie-session";
import authRouter from "./controllers/Auth/auth";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

app.use(
  cookieSession({
    name: "session",
    keys: ["secret"],
    maxAge: 24 * 60 * 60 * 1000,
  })
);

app.use("/api/auth", authRouter);

export default app;
