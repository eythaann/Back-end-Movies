import { Application, Request, Response } from "express";
import pool from "../database";

export const loadApiEndpoints = (app: Application): void => {
  app.get("/movies", (req: Request, res: Response) => {
    pool.query("SELECT * FROM movies", (err, result) => {
      if (err) throw err;
      return res.status(200).json(result);
    });
  });

  app.get("/movie/:id", (req: Request, res: Response) => {
    const movie = req.params.id;
    pool.query(`SELECT * FROM movies WHERE id=${movie}`, (err, result) => {
      if (err) throw err;
      return res.status(200).json(result);
    });
  });

  app.get("/actors", (req: Request, res: Response) => {
    pool.query("SELECT * FROM actors", (err, result) => {
      if (err) throw err;
      return res.status(200).json(result);
    });
  });

  app.get("/actor/:id", (req: Request, res: Response) => {
    const actor = req.params.id;
    pool.query(`SELECT * FROM actors WHERE id=${actor}`, (err, result) => {
      if (err) throw err;
      return res.status(200).json(result);
    });
  });
};
