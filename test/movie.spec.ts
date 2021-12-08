import request from "supertest";
import { app, pool } from "../src/app";
import movie from "../src/interfaces/movie.interface";

const api = "/api/v1";

let movie = {
  title: "El oso Dorado 5000",
  description:
    "Habia un oso de color dorado que le gustaba comer sushi e ir a la playa",
  trailerLink: "https://youtube.com/test",
  premiere: "2008-01-25",
  gener: "Action",
  duration: "144",
  rating: 1,
};
const cache = movie;

describe("Test Movies API, /movies and /movie/:id", () => {
  describe("GET /movies", () => {
    it("should return 200", () => {
      return request(app)
        .get(api + "/movies")
        .expect(200);
    });

    it("The Response is a Array ", () => {
      return request(app)
        .get(api + "/movies")
        .expect((res) => expect(res.body).toBeInstanceOf(Array));
    });
  });

  describe("GET /movie/:id", () => {
    it("should return 200", () => {
      return request(app)
        .get(api + "/movie/1")
        .expect(200);
    });

    it("should be a Object ", () => {
      return request(app)
        .get(api + "/movie/1")
        .expect((res) => {
          expect(res.body).toBeInstanceOf(Object);
          expect(res.body).not.toBeInstanceOf(Array);
        });
    });

    it("If not exist return Error", () => {
      return request(app)
        .get(api + "/movie/564861512")
        .expect((res) => expect(res.body).toEqual({ error: "Not Exist" }));
    });
  });
  let postId: any = null;
  describe("POST /movie", () => {
    it("should response id: number ", () => {
      return request(app)
        .post(api + "/movie")
        .send(movie)
        .expect(201)
        .expect((res) => {
          postId = res.body.id;
          return expect(typeof res.body.id).toBe("number");
        });
    });
    describe("should validators works", () => {
      it("should no empty title", () => {
        movie.title = "";
        return request(app)
          .post(api + "/movie")
          .send(movie)
          .expect(400);
      });
      movie = cache;
      it("should no empty description", () => {
        movie.description = "";
        return request(app)
          .post(api + "/movie")
          .send(movie)
          .expect(400);
      });
      movie = cache;
      it("should trailerLink is a URL", () => {
        movie.trailerLink = "youtube.com";
        return request(app)
          .post(api + "/movie")
          .send(movie)
          .expect(400);
      });
      movie = cache;
      it("should premiere is valid date", () => {
        movie.premiere = "2012-13-15";
        return request(app)
          .post(api + "/movie")
          .send(movie)
          .expect(400);
      });
      movie = cache;
      it("should gener no is Empty", () => {
        movie.gener = "";
        return request(app)
          .post(api + "/movie")
          .send(movie)
          .expect(400);
      });
      movie = cache;
      it("should duration no is Empty", () => {
        movie.duration = "";
        return request(app)
          .post(api + "/movie")
          .send(movie)
          .expect(400);
      });
      movie = cache;
    });
  });

  describe("PUT /movie/:id", () => {
    const movie2 = {
      title: "El oso Dorado 3000",
      description:
        "Habia un oso de color dorado que le gudsadasstaba comer sushi e ir a la playa",
      trailerLink: "https://youtube.com/testdsad",
      premiere: "2001-02-26",
      gener: "Terror",
      duration: "110",
      rating: 3,
    };
    it("should {done: done} ", () => {
      return request(app)
        .put(api + "/movie/" + postId)
        .send(movie2)
        .expect(201)
        .expect((res) => expect(res.body).toEqual({ done: "done" }));
    });
  });

  describe("DELETE /movie/:id", () => {
    it("should {done: done}", () => {
      return request(app)
        .delete(api + "/movie/" + postId)
        .send()
        .expect(202)
        .expect((res) => expect(res.body).toEqual({ done: "done" }));
    });
  });
});

afterAll((done) => {
  pool.end();
  done();
});
