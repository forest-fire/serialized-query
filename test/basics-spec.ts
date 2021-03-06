// tslint:disable:no-implicit-dependencies
import { SerializedQuery } from "../src/serialized-query";
import * as chai from "chai";
import { DB, RealTimeDB } from "abstracted-admin";
import { List, FireModel } from "firemodel";
import { Person } from "./testing/Person";
import * as helpers from "./testing/helpers";
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
helpers.setupEnv();
const expect = chai.expect;

describe("Serialized Query: ", () => {
  let mockDb: RealTimeDB;
  before(async () => {
    mockDb = await DB.connect({ mocking: true });
    FireModel.defaultDb = mockDb;
  });
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

  it.skip("orderByChild() allows server side to filter appropriate records", async () => {
    mockDb.mock.updateDB(peopleDataset());
    await helpers.wait(50);
    const query = new SerializedQuery<Person>()
      .orderByChild("age")
      .limitToLast(2);
    // const list = await List.fromQuery(Person, query);

    // expect(list.data).to.have.lengthOf(2);

    // let age = 0;
    // list.map(i => {
    //   expect(i.age).to.be.greaterThan(age);
    //   age = i.age;
    // });
  });

  it("same query structure gives same hashCode", async () => {
    const foo = new SerializedQuery("/foo/bar").orderByChild("goober");
    const bar = new SerializedQuery("/foo/bar").orderByChild("goober");
    expect(foo.hashCode()).to.equal(bar.hashCode());
    const foo2 = new SerializedQuery("/foo/bar2")
      .orderByChild("goober")
      .limitToFirst(5);
    const bar2 = new SerializedQuery("/foo/bar2")
      .orderByChild("goober")
      .limitToFirst(5);
    expect(foo2.hashCode()).to.equal(bar2.hashCode());
  });

  it("different query structure gives different hashCode", async () => {
    const foo2 = new SerializedQuery("/foo/bar")
      .orderByChild("goober")
      .limitToFirst(5);
    const bar2 = new SerializedQuery("/foo/bar").orderByChild("goober");
    expect(foo2.hashCode()).to.not.equal(bar2.hashCode());
  });

  it("identity property provides appropriate details", () => {
    const foo = new SerializedQuery("/foo/bar").orderByChild("goober");
    expect(foo.identity).to.be.an("object");
    expect(foo.identity.orderBy).to.equal("orderByChild");
    expect(foo.identity.orderByKey).to.equal("goober");
    expect(foo.identity.limitToFirst).to.equal(undefined);
    expect(foo.identity.startAt).to.equal(undefined);
  });

  it("setting different props for equalTo and orderByChild behaves as expected", async () => {
    const q = new SerializedQuery()
      .orderByChild("foobar")
      .equalTo("foo", "bar");
    expect(q.identity.equalToKey).is.equal("bar");
  });

  it.only("limitToFirst sets identity()", async () => {
    const q = new SerializedQuery().orderByValue().limitToFirst(3);
    expect(q.identity.limitToFirst).is.equal(3);
  });

  it.only("limitToLast sets identity()", async () => {
    const q = new SerializedQuery().orderByValue().limitToLast(3);
    expect(q.identity.limitToLast).is.equal(3);
  });
});
