import { Record, List, Watch, FireModel } from "firemodel";
import { DB } from "abstracted-admin";
import * as chai from "chai";
const expect = chai.expect;
import "reflect-metadata";
import { Person } from "./testing/Person";
import * as helpers from "./testing/helpers";
import { IDictionary, wait, pathJoin } from "common-types";
import { SerializedQuery } from "../src/serialized-query";

helpers.setupEnv();
const peopleDataset = () => ({
  authenticated: {
    people: {
      a: {
        name: "Oldy McOldy",
        age: 99,
        favoriteColor: "blue",
        createdAt: new Date().getTime() - 100000,
        lastUpdated: new Date().getTime()
      },
      b: {
        name: "Midlife Crises",
        age: 50,
        favoriteColor: "blue",
        createdAt: new Date().getTime() - 200005,
        lastUpdated: new Date().getTime() - 5000
      },
      c: {
        name: "Babyface Bob",
        age: 3,
        favoriteColor: "blue",
        createdAt: new Date().getTime() - 200000,
        lastUpdated: new Date().getTime() - 2000
      },
      d: {
        name: "Punkass Teen",
        age: 17,
        favoriteColor: "green",
        createdAt: new Date().getTime() - 100005,
        lastUpdated: new Date().getTime() - 10000
      },
      e: {
        name: "Old Fart",
        age: 98,
        favoriteColor: "green",
        createdAt: new Date().getTime() - 100005,
        lastUpdated: new Date().getTime() - 10000
      }
    }
  }
});

let db: DB;

describe("Tests using REAL db =>’", () => {
  before(async () => {
    db = await DB.connect();
    FireModel.defaultDb = db;
    db.set("/", peopleDataset());
  });
  after(async () => {
    await db.remove(`/authenticated/fancyPeople`, true);
    db.remove("/authenticated");
  });

  it.only("equalTo() deserializes into valid response", async () => {
    const q = new SerializedQuery(List.dbPath(Person))
      .orderByChild("favoriteColor")
      .equalTo("green", "favoriteColor");
    const r = db.ref();
    const fbQuery = q.deserialize({ ref: () => r });
    const snap = (await fbQuery.once("value")).child("authenticated/people");
    console.log(snap.val());
    expect(snap.hasChildren()).to.equal(true);
  });

  it("where clause on non-dynamic path", async () => {
    throw new Error("test not written");
  });

  it("where clause on dynamic path", async () => {
    throw new Error("test not written");
  });
});
