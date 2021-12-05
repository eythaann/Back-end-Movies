import request from "supertest";
import { app, pool } from "../src/app";
import movie from "../src/interfaces/movie.interface";

const movie = {
  title: "El oso Dorado",
  description:
    "Habia un oso de color dorado que le gustaba comer sushi e ir a la playa",
  trailerLink: "https://youtube.com/test",
  premiere: "2008-01-25",
};
describe("Test Movies API, /movies and /movie/:id", () => {
  describe("GET /movies", () => {
    it("should return 200", () => {
      return request(app).get("/movies").expect(200);
    });

    it("The Response is a Array ", () => {
      return request(app)
        .get("/movies")
        .expect((res) => expect(res.body).toBeInstanceOf(Array));
    });
  });

  describe("GET /movie/:id", () => {
    it("should return 200", () => {
      return request(app).get("/movie/1").expect(200);
    });

    it("should be a Object ", () => {
      return request(app)
        .get("/movie/1")
        .expect((res) => {
          expect(res.body).toBeInstanceOf(Object);
          expect(res.body).not.toBeInstanceOf(Array);
        });
    });

    it("If not exist return Error", () => {
      return request(app)
        .get("/movie/564861512")
        .expect((res) => expect(res.body).toEqual({ error: "Not Exist" }));
    });
  });

  describe("POST /movie", () => {
    it("should response id: number ", () => {
      return request(app)
        .post("/movie")
        .send(movie)
        .expect(201)
        .expect((res) => expect(typeof res.body.id).toBe("number"));
    });
    describe("should validators works", () => {
      it("should no empty title", () => {
        movie.title = "";
        return request(app).post("/movie").send(movie).expect(400);
      });
      it("should no empty description", () => {
        movie.description = "";
        return request(app).post("/movie").send(movie).expect(400);
      });
      it("should trailerLink is a URL", () => {
        movie.trailerLink = "youtube.com";
        return request(app).post("/movie").send(movie).expect(400);
      });
      it("should premiere is valid date", () => {
        movie.premiere = "2012-13-15";
        return request(app).post("/movie").send(movie).expect(400);
      });
    });
  });
});

afterAll((done) => {
  pool.end();
  done();
});
