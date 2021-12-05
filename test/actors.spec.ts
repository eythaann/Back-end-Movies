import request from "supertest";
import { app, pool } from "../src/app";

const actor = {
  name: "Carlos",
  lastname: "Prueba",
  biography: "Nacio alla en un ranchito en manabi alado de un rio",
  born: "1950-06-15",
  death: "2009-01-03",
  place: "Guayaquil",
};
describe("Test Actors API, /actors and /actor/:id", () => {
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
        .expect((res) => {
          expect(res.body).toBeInstanceOf(Object);
          expect(res.body).not.toBeInstanceOf(Array);
        });
    });

    it("If not exist return Error", () => {
      return request(app)
        .get("/actor/564861512")
        .expect((res) => expect(res.body).toEqual({ error: "Not Exist" }));
    });
  });

  describe("POST /actor", () => {
    it("should response id: number ", () => {
      return request(app)
        .post("/actor")
        .send(actor)
        .expect(201)
        .expect((res) => expect(typeof res.body.id).toBe("number"));
    });
    describe("should validators works", () => {
      it("should no empty name", () => {
        actor.name = "";
        return request(app).post("/actor").send(actor).expect(400);
      });
      it("should no empty lastname", () => {
        actor.lastname = "";
        return request(app).post("/actor").send(actor).expect(400);
      });
      it("should no empty biography", () => {
        actor.biography = "";
        return request(app).post("/actor").send(actor).expect(400);
      });
      it("should no empty place", () => {
        actor.place = "youtube.com";
        return request(app).post("/actor").send(actor).expect(400);
      });
      it("should born is valid date", () => {
        actor.born = "2012-13-15";
        return request(app).post("/actor").send(actor).expect(400);
      });
    });
  });
});

afterAll((done) => {
  pool.end();
  done();
});
