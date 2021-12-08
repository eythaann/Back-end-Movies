import request from "supertest";
import { app, pool } from "../src/app";

const api = "/api/v1";

let actor = {
  name: "Carlos",
  biography: "Nacio alla en un ranchito en manabi alado de un rio",
  born: "1950-06-15",
  death: "2009-01-03",
  place: "Guayaquil",
};
const cache = actor;

describe("Test Actors API, /actors and /actor/:id", () => {
  describe("GET /actors", () => {
    it("should return 200", () => {
      return request(app)
        .get(api + "/actors")
        .expect(200);
    });

    it("the response is a Array", () => {
      return request(app)
        .get(api + "/actors")
        .expect((res) => expect(res.body).toBeInstanceOf(Array));
    });
  });

  describe("GET /actor/:id", () => {
    it("should return 200", () => {
      return request(app)
        .get(api + "/actor/1")
        .expect(200);
    });

    it("should be a Object", () => {
      return request(app)
        .get(api + "/actor/1")
        .expect((res) => {
          expect(res.body).toBeInstanceOf(Object);
          expect(res.body).not.toBeInstanceOf(Array);
        });
    });

    it("If not exist return Error", () => {
      return request(app)
        .get(api + "/actor/564861512")
        .expect((res) => expect(res.body).toEqual({ error: "Not Exist" }));
    });
  });
  let postId: any = null;
  describe("POST /actor", () => {
    it("should response id: number ", () => {
      return request(app)
        .post(api + "/actor")
        .send(actor)
        .expect(201)
        .expect((res) => {
          postId = res.body.id;
          return expect(typeof res.body.id).toBe("number");
        });
    });
    describe("should validators works", () => {
      it("should no empty name", () => {
        actor.name = "";
        return request(app)
          .post(api + "/actor")
          .send(actor)
          .expect(400);
      });
      actor = cache;
      it("should no empty biography", () => {
        actor.biography = "";
        return request(app)
          .post(api + "/actor")
          .send(actor)
          .expect(400);
      });
      actor = cache;
      it("should no empty place", () => {
        actor.place = "youtube.com";
        return request(app)
          .post(api + "/actor")
          .send(actor)
          .expect(400);
      });
      actor = cache;
      it("should born is valid date", () => {
        actor.born = "2012-13-15";
        return request(app)
          .post(api + "/actor")
          .send(actor)
          .expect(400);
      });
      actor = cache;
    });
  });

  describe("PUT /actor/:id", () => {
    const actor2 = {
      name: "Carlito",
      biography:
        "Nacio alla edsadn un ranchitsado en manabi aladsdasdo de un rio",
      born: "1952-05-16",
      death: "2008-03-05",
      place: "Quito",
    };
    it("should {done: done} ", () => {
      return request(app)
        .put(api + "/actor/" + postId)
        .send(actor2)
        .expect(201)
        .expect((res) => expect(res.body).toEqual({ done: "done" }));
    });
  });

  describe("DELETE /actor/:id", () => {
    it("should {done: done}", () => {
      return request(app)
        .delete(api + "/actor/" + postId)
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
