import { createPool } from "mysql";
import { config } from "./config/database";

const pool = createPool(config);

pool.getConnection((err, connection) => {
  if (err) {
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      console.error("Database connection was closed. ");
    }
    if (err.code === "ER_CON_COUNT_ERROR") {
      console.error("Database has to many connections");
    }
    if (err.code === "ECONNREFUSED") {
      console.error("Database connection was refused");
    }
    if (err.code === "ETIMEDOUT") {
      console.error("Database is lost");
    }
  }

  if (connection) {
    connection.release();
    console.log("Database is Connected");
  }
  return;
});

export default pool;
