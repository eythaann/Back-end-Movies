import { Application, Request, Response } from "express";
import multer from "multer";
import pool from "../database";
import movie from "../interfaces/movie.interface";
import { body, validationResult } from "express-validator";
const storage = multer.diskStorage({
  destination: "public/assets/img",
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({
  storage: storage,
  dest: "public/assets/img",
});

export const loadApiEndpoints = (app: Application): void => {
  app.get("/movies", (req: Request, res: Response) => {
    pool.query("SELECT * FROM movies", (err, result) => {
      if (err) throw err;
      return res.status(200).json(result);
    });
  });

  app.post(
    "/movies",
    [
      body("title").isLength({ min: 1 }),
      body("description").isLength({ min: 1 }),
      body("trailerLink").isLength({ min: 1 }),
      body("premiere").isLength({ min: 1 }),
    ],
    upload.single("coverPage"),
    (req: Request, res: Response) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.json(errors);

      const movie: movie = {
        title: req.body.title,
        description: req.body.description,
        trailerLink: req.body.trailerLink,
        premiere: req.body.premiere,
        img: req.file?.path || "no-image",
      };

      pool.query(`INSERT INTO movies SET ?`, [movie], (err, result, fields) => {
        if (err) throw err;
        return res.json({ id: result.insertId });
      });
    }
  );

  app.get("/movie/:id", (req: Request, res: Response) => {
    const movie = req.params.id;
    pool.query(`SELECT * FROM movies WHERE id=${movie}`, (err, result) => {
      if (err) throw err;
      return result.length === 0
        ? res.status(404).json({ error: "Not Exist" })
        : res.status(200).json(result);
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
      return result.length === 0
        ? res.status(404).json({ error: "Not Exist" })
        : res.status(200).json(result);
    });
  });
};
