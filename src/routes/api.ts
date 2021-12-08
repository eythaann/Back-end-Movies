import express, { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { Pool } from "mysql";
import { MoviesApi } from "./movies";
import { ActorsApi } from "./actors";

const app = express();

export const loadApiEndpoints = (pool: Pool) => {
  //Import Movies Routes
  MoviesApi(app, pool);

  //Import Actors Routes
  ActorsApi(app, pool);

  //Other Routes
  //Add References of Movies and Actors
  app.post(
    "/cast",
    [
      body("movieId", "movieId empty").isLength({ min: 1 }),
      body("actorId", "movieId empty").isLength({ min: 1 }),
      body("interpretation", "movieId empty").isLength({ min: 1 }),
    ],
    (req: Request, res: Response) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json(errors);

      const cast = {
        actorsid: req.body.actorId,
        moviesid: req.body.movieId,
        interpretation: req.body.interpretation,
      };

      pool.query(`INSERT INTO casts SET ?`, [cast], (err) => {
        if (err) throw err;
        return res.status(201).json({ done: "done" });
      });
    }
  );

  //Get All Geners Avaivable
  app.get("/geners", (req: Request, res: Response) => {
    pool.query(`SELECT * FROM gener`, (err, result) => {
      if (err) throw err;
      res.status(200).json(result);
    });
  });

  //Export the routes to app.ts
  return app;
};
