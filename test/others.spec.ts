import request from "supertest";
import { app, pool } from "../src/app";

const api = "/api/v1";

describe("GET /geners", () => {
  it("should Response 200", () => {
    return request(app)
      .get(api + "/geners")
      .expect(200);
  });
  it("The Response is a Array ", () => {
    return request(app)
      .get(api + "/geners")
      .expect((res) => expect(res.body).toBeInstanceOf(Array));
  });
});

afterAll((done) => {
  pool.end();
  done();
});
