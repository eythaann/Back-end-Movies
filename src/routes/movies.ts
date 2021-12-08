import { Application, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import multer from "multer";
import { Pool } from "mysql";

//Multer Config For all Movies Routes (Multer is a file saver)
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

export const MoviesApi = (app: Application, pool: Pool) => {
  /* ALL ROUTES ARE ORDER BY GET; POST; PUT; DELETE */

  //Get All movies in the DB
  app.get("/movies", (req: Request, res: Response) => {
    try {
      pool.query("SELECT * FROM movies ORDER BY id DESC", (err, result) => {
        if (err) throw err;
        return res.status(200).json(result);
      });
    } catch (err) {
      console.log(err);
    }
  });

  //Get just One Movie
  app.get("/movie/:id", (req: Request, res: Response) => {
    const movie = req.params.id;
    if (!movie) res.status(400).json({ err: "no-id" });

    try {
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
    } catch (err) {
      console.log(err);
    }
  });

  //Add a new Movie to the DB
  app.post(
    "/movie",
    upload.single("image"),
    [
      body("title", "Empty").isLength({ min: 1 }),
      body("description", "Min 30 Characters").isLength({ min: 30 }),
      body("trailerLink", "Not is a URL").isURL(),
      body("rating", "Empty").isLength({ min: 1 }),
      body("premiere", "Not is a Date").isDate(),
      body("gener", "Empty").isLength({ min: 1 }),
      body("duration", "Empty").isLength({ min: 1 }),
    ],
    (req: Request, res: Response) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json(errors);
      const img = req.file?.path.slice(6) || "/assets/err/no-image.png";

      const movie = {
        title: req.body.title,
        description: req.body.description,
        trailerLink: req.body.trailerLink,
        premiere: req.body.premiere,
        rating: req.body.rating,
        gener: req.body.gener,
        duration: req.body.duration,
        img,
      };

      try {
        pool.query(
          `SELECT * FROM movies WHERE title="${movie.title}"`,
          (err, result) => {
            if (err) throw err;
            if (result.length > 0)
              return res
                .status(202)
                .json({ alert: "Already Exist a Movie With This Title" });

            pool.query(`INSERT INTO movies SET ?`, [movie], (err, result) => {
              if (err) throw err;
              return res.status(201).json({ id: result.insertId });
            });
          }
        );
      } catch (err) {
        console.log(err);
      }
    }
  );

  //Update a existing movie
  app.put(
    "/movie/:id",
    upload.single("image"),
    [
      body("title", "Empty").isLength({ min: 1 }),
      body("description", "Min 30 Characters").isLength({ min: 30 }),
      body("trailerLink", "Not is a URL").isURL(),
      body("rating", "Empty").isLength({ min: 1 }),
      body("premiere", "Not is a Date").isDate(),
      body("gener", "Empty").isLength({ min: 1 }),
      body("duration", "Empty").isLength({ min: 1 }),
    ],
    (req: Request, res: Response) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json(errors);

      const movie: any = {
        title: req.body.title,
        description: req.body.description,
        trailerLink: req.body.trailerLink,
        premiere: req.body.premiere,
        rating: req.body.rating,
        gener: req.body.gener,
        duration: req.body.duration,
      };

      const img = req.file?.path.slice(6);
      if (img) movie.img = img;

      try {
        pool.query(
          `UPDATE movies SET ? WHERE movies.id = "${req.params.id}"`,
          [movie],
          (err, result) => {
            if (err) throw err;
            return res.status(201).json({ done: "done" });
          }
        );
      } catch (err) {
        console.log(err);
      }
    }
  );

  //Delete a Movie and All its References
  app.delete("/movie/:id", (req, res) => {
    try {
      pool.query(
        `DELETE FROM casts WHERE moviesid="${req.params.id}"`,
        (err) => {
          if (err) throw err;
          pool.query(
            `DELETE FROM movies WHERE id="${req.params.id}"`,
            (err) => {
              if (err) throw err;
              return res.status(202).json({ done: "done" });
            }
          );
        }
      );
    } catch (err) {
      console.log(err);
    }
  });
};
