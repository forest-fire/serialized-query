// tslint:disable:no-implicit-dependencies
import { SerializedQuery } from "../src/serialized-query";
import * as chai from "chai";

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
});
