import request from "supertest";
import app from "../src/app";
import pool from "../src/database";

describe("Test de Actors API, /actors and /actor/:id", () => {
  describe("GET /actors", () => {
    it("should return 200", () => {
      return request(app).get("/actors").expect(200);
    });

    it("the response is a Array", () => {
      return request(app)
        .get("/actors")
        .expect((res) => expect(res.body).toBeInstanceOf(Array));
    });
  });

  describe("GET /actor/:id", () => {
    it("should return 200", () => {
      return request(app).get("/actor/1").expect(200);
    });

    it("should be a Object", () => {
      return request(app)
        .get("/actor/1")
        .expect((res) => expect(res.body).toBeInstanceOf(Object));
    });

    it("If not exist return Error", () => {
      return request(app)
        .get("/actor/564861512")
        .expect((res) => expect(res.body).toEqual({ error: "Not Exist" }));
    });
  });
});

afterAll((done) => {
  pool.end();
  done();
});
