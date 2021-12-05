import express from "express";
import path from "path";
import pool from "./database";
import { loadApiEndpoints } from "./routes/api";

// Create Express server
const app = express();

// Express configuration
app.set("port", process.env.PORT || 3000);
app.set("env", process.env.NODE_ENV || "development");

//middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  express.static(path.join(__dirname, "../public"), { maxAge: 31557600000 })
);

loadApiEndpoints(app, pool);

export { app, pool };
