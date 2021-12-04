import request from "supertest";
import app from "../src/app";
import pool from "../src/database";

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
      .expect((res) => expect(res.body).toBeInstanceOf(Object));
  });

  it("If not exist return Error", () => {
    return request(app)
      .get("/movie/564861512")
      .expect((res) => expect(res.body).toEqual({ error: "Not Exist" }));
  });
});

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

afterAll((done) => {
  pool.end();
  done();
});
