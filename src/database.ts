import { createPool, Pool } from "mysql";
import { dev, prod } from "./config/database";

//Select the Database if is Prod or Dev mode
const env = process.env.NODE_ENV || "development";
const pool = env === "production" ? createPool(prod) : createPool(dev);

//Handle Errors of the DB conection
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
    console.log(`Database is Connected on ${env}`);
  }
  return;
});

export default pool;
