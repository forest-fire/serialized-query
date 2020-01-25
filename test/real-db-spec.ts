import { expect } from "chai";
import { List } from "firemodel";
import { DB } from "abstracted-admin";
import { Person } from "./testing/Person";
import * as helpers from "./testing/helpers";
import { SerializedQuery } from "../src/serialized-query";
import { hashToArray } from "typed-conversions";
import peopleDataset from "./data/people";
helpers.setupEnv();

let db: DB;

describe("Tests using REAL db =>’", () => {
  before(async () => {
    db = await DB.connect();
    List.defaultDb = db;
    await db.set("/", peopleDataset());
  });
  after(async () => {
    await db.remove(`/authenticated/fancyPeople`, true);
    db.remove("/authenticated");
  });

  it("equalTo() deserializes into valid response", async () => {
    const q = new SerializedQuery(List.dbPath(Person))
      .orderByChild("favoriteColor")
      .equalTo("green");

    const deserializedQuery = q.deserialize(db);
    const manualQuery = db
      .ref("/authenticated/people")
      .orderByChild("favoriteColor")
      .equalTo("green");

    const manualJSON = hashToArray((await manualQuery.once("value")).toJSON());
    const deserializedJSON = hashToArray(
      (await deserializedQuery.once("value")).toJSON()
    );

    expect(manualJSON.length).to.equal(deserializedJSON.length);
    expect(deserializedJSON.length).to.be.greaterThan(0);
    deserializedJSON.forEach(i => expect(i.favoriteColor).to.equal("green"));
  });

  it("limit query reduces result set", async () => {
    const q = new SerializedQuery(List.dbPath(Person))
      .orderByChild("age")
      .limitToFirst(2);

    const deserializedJson: Person[] = hashToArray(
      (await q.execute(db)).toJSON()
    );
    const sortedPeople = hashToArray<Person>(
      peopleDataset().authenticated.people
    ).sort((a, b) => (a.age > b.age ? 1 : -1));

    expect(deserializedJson.length).to.equal(2);
    expect(deserializedJson[0].age).to.equal(sortedPeople[0].age);
  });

  it("Firemodel List.where() reduces the result set to appropriate records", async () => {
    const peeps = await List.where(Person, "favoriteColor", "green");
    const people = hashToArray<Person>(peopleDataset().authenticated.people);
    expect(peeps.length).to.equal(people.length);
  });
});
