import express from "express";
import path from "path";
import pool from "./database";
import cors from "cors";
import { loadApiEndpoints } from "./routes/api";

// Create Express server
const app = express();

// Express configuration
app.set("port", process.env.PORT || 4000);
app.set("env", process.env.NODE_ENV || "development");

//Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(
  express.static(path.join(__dirname, "../public"), { maxAge: 31557600000 })
);

//Routes
app.use("/api/v1", loadApiEndpoints(pool));

//Build de Front-end React

export { app, pool };
