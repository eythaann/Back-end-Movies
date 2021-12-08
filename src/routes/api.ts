import { Application, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import multer from "multer";
import { Pool } from "mysql";
import { isDate } from "util/types";

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
    pool.query("SELECT * FROM movies ORDER BY id DESC", (err, result) => {
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
      body("rating", "Empty").isLength({ min: 1 }),
      body("premiere", "Not is a Date").isDate(),
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
    pool.query("SELECT * FROM actors ORDER BY id DESC", (err, result) => {
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

      let death = null;
      if (isDate(req.body.death)) death = req.body.death;

      const actor = {
        name: req.body.name,
        biography: req.body.biography,
        born: req.body.born,
        death,
        place: req.body.place,
        img,
      };

      pool.query(`INSERT INTO actors SET ?`, [actor], (err, result) => {
        if (err) throw err;
        return res.status(201).json({ id: result.insertId });
      });
    }
  );

  app.delete("/actor/:id", (req: Request, res: Response) => {
    pool.query(`DELETE FROM casts WHERE actorsid="${req.params.id}"`, (err) => {
      if (err) throw err;
      pool.query(`DELETE FROM actors WHERE id="${req.params.id}"`, (err) => {
        if (err) throw err;
        return res.status(202).json({ done: "done" });
      });
    });
  });

  app.delete("/movie/:id", (req, res) => {
    pool.query(`DELETE FROM casts WHERE moviesid="${req.params.id}"`, (err) => {
      if (err) throw err;
      pool.query(`DELETE FROM movies WHERE id="${req.params.id}"`, (err) => {
        if (err) throw err;
        return res.status(202).json({ done: "done" });
      });
    });
  });

  app.post(
    "/cast",
    [
      body("movieId", "movieId empty").isLength({ min: 1 }),
      body("actorId", "movieId empty").isLength({ min: 1 }),
      body("interpretation", "movieId empty").isLength({ min: 1 }),
    ],
    (req: Request, res: Response) => {
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

  app.put(
    "/movie/:id",
    upload.single("image"),
    [
      body("title", "Empty").isLength({ min: 1 }),
      body("description", "Min 30 Characters").isLength({ min: 30 }),
      body("trailerLink", "Not is a URL").isURL(),
      body("rating", "Empty").isLength({ min: 1 }),
      body("premiere", "Not is a Date").isDate(),
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
        img,
      };

      pool.query(
        `UPDATE movies SET ? WHERE movies.id = "${req.params.id}"`,
        [movie],
        (err, result) => {
          if (err) throw err;
          return res.status(201).json({ done: "done" });
        }
      );
    }
  );

  app.put(
    "/actor/:id",
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

      let death = null;
      if (isDate(req.body.death)) death = req.body.death;

      const actor = {
        name: req.body.name,
        biography: req.body.biography,
        born: req.body.born,
        death,
        place: req.body.place,
        img,
      };

      pool.query(
        `UPDATE actors SET ? WHERE actors.id = "${req.params.id}"`,
        [actor],
        (err, result) => {
          if (err) throw err;
          return res.status(201).json({ done: "done" });
        }
      );
    }
  );
};
