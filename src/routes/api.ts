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
      try {
        pool.query(
          `Select * FROM casts WHERE actorsid="${cast.actorsid}" && moviesid="${cast.moviesid}"`,
          (err, result) => {
            if (err) throw err;
            if (result.length > 0)
              return res.status(202).json({ alert: "Already Exist" });

            pool.query(`INSERT INTO casts SET ?`, [cast], (err) => {
              if (err) throw err;
              return res.status(201).json({ done: "done" });
            });
          }
        );
      } catch (err) {
        console.log(err);
      }
    }
  );

  //Get All Geners Avaivable
  app.get("/geners", (req: Request, res: Response) => {
    try {
      pool.query(`SELECT * FROM gener`, (err, result) => {
        if (err) throw err;
        res.status(200).json(result);
      });
    } catch (err) {
      console.log(err);
    }
  });

  //Export the routes to app.ts
  return app;
};
