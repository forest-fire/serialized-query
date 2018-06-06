// tslint:disable:no-implicit-dependencies
import { SerializedQuery } from "../src/serialized-query";
import * as chai from "chai";
import DB from "abstracted-admin";
import { Record, Model, List } from "firemodel";
import { Person } from "./testing/Person";
import * as helpers from "./testing/helpers";
helpers.setupEnv();

const peopleDataset = () => ({
  authenticated: {
    people: {
      a: {
        name: "Oldy McOldy",
        age: 99,
        createdAt: new Date().getTime() - 100000,
        lastUpdated: new Date().getTime()
      },
      b: {
        name: "Midlife Crises",
        age: 50,
        createdAt: new Date().getTime() - 200005,
        lastUpdated: new Date().getTime() - 5000
      },
      c: {
        name: "Babyface Bob",
        age: 3,
        createdAt: new Date().getTime() - 200000,
        lastUpdated: new Date().getTime() - 2000
      },
      d: {
        name: "Punkass Teen",
        age: 17,
        createdAt: new Date().getTime() - 100005,
        lastUpdated: new Date().getTime() - 10000
      },
      e: {
        name: "Old Fart",
        age: 98,
        createdAt: new Date().getTime() - 100005,
        lastUpdated: new Date().getTime() - 10000
      }
    }
  }
});
helpers.setupEnv();
const mockDb = new DB({ mocking: true });
// const db = new DB();
const expect = chai.expect;

describe("Serialized Query: ", () => {
  it("instantiates", () => {
    const q = new SerializedQuery("foo");
    expect(q).to.be.an.instanceOf(SerializedQuery);
  });
  it("instantiate with path()", () => {
    const q = SerializedQuery.path("foo");
    expect(q).to.be.an.instanceOf(SerializedQuery);
  });

  it("instantiate without path, path set later", () => {
    const q = new SerializedQuery();
    expect(q.path).to.equal("/");
    q.setPath("/foobar");
    expect(q.path).to.equal("/foobar");
  });

  it("orderByChild() allows server side to filter appropriate records", async () => {
    Model.defaultDb = mockDb;
    mockDb.mock.updateDB(peopleDataset());
    await helpers.wait(50);
    const query = new SerializedQuery().orderByChild("age").limitToLast(2);
    const list = await List.from(Person, query);

    expect(list.data).to.have.lengthOf(2);

    let age = 0;
    list.map(i => {
      expect(i.age).to.be.greaterThan(age);
      age = i.age;
    });
  });
});
