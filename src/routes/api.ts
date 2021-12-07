import { Application, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import multer from "multer";
import { Pool } from "mysql";

import movie from "../interfaces/movie.interface";

const storage = multer.diskStorage({
  destination: "public/assets/img",
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + ".jpg");
  },
});
const upload = multer({
  storage: storage,
  dest: "public/assets/img",
});

export const loadApiEndpoints = (app: Application, pool: Pool): void => {
  app.get("/movies", (req: Request, res: Response) => {
    pool.query("SELECT * FROM movies", (err, result) => {
      if (err) throw err;
      return res.status(200).json(result);
    });
  });

  app.post(
    "/movie",
    upload.single("image"),
    [
      body("title", "Empty").isLength({ min: 1 }),
      body("description", "Min 30 Characters").isLength({ min: 30 }),
      body("trailerLink", "Not is a URL").isURL(),
      body("premiere", "Not is a Date").isDate(),
    ],
    (req: Request, res: Response) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json(errors);
      const img = req.file?.path.slice(6) || "/assets/err/no-image.png";

      const movie: movie = {
        title: req.body.title,
        description: req.body.description,
        trailerLink: req.body.trailerLink,
        premiere: req.body.premiere,
        img,
      };

      pool.query(`INSERT INTO movies SET ?`, [movie], (err, result) => {
        if (err) throw err;
        return res.status(201).json({ id: result.insertId });
      });
    }
  );

  app.get("/movie/:id", (req: Request, res: Response) => {
    const movie = req.params.id;
    if (!movie) res.status(400).json({ err: "no-id" });
    pool.query(`SELECT * FROM movies WHERE id="${movie}"`, (err, result) => {
      if (err) throw err;
      if (result.length === 0)
        return res.status(404).json({ error: "Not Exist" });

      pool.query(
        `SELECT * FROM casts INNER JOIN actors 
        ON actors.id=casts.actorsid && casts.moviesid="${movie}"`,
        (err, actors) => {
          if (err) throw err;
          result[0].cast = actors;
          return res.status(200).json(result[0]);
        }
      );
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
    if (!actor) res.status(400).json({ err: "no-id" });
    pool.query(`SELECT * FROM actors WHERE id="${actor}"`, (err, result) => {
      if (err) throw err;
      if (result.length === 0)
        return res.status(404).json({ error: "Not Exist" });

      pool.query(
        `SELECT movies.id, movies.title, movies.img, casts.interpretation 
        FROM casts INNER JOIN movies 
        ON movies.id=casts.moviesid && casts.actorsid="${actor}"`,
        (err, movies) => {
          if (err) throw err;
          result[0].interpretations = movies;
          return res.status(200).json(result[0]);
        }
      );
    });
  });

  app.post(
    "/actor",
    upload.single("image"),
    [
      body("name", "Min 2 Characters,max30").isLength({ min: 2, max: 30 }),
      body("biography", "Min 30 Max 500").isLength({ min: 30, max: 500 }),
      body("born", "Not is a Date").isDate(),
      body("place", "Min 2 Characters, max 50").isLength({ min: 2, max: 50 }),
    ],
    (req: Request, res: Response) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json(errors);
      const img = req.file?.path.slice(6) || "/assets/err/no-image.png";
      const actor = {
        name: req.body.name,
        biography: req.body.biography,
        born: req.body.born,
        death: req.body.death,
        place: req.body.place,
        img,
      };

      pool.query(`INSERT INTO actors SET ?`, [actor], (err, result) => {
        if (err) throw err;
        return res.status(201).json({ id: result.insertId });
      });
    }
  );
};
