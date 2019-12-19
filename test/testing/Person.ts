// tslint:disable:no-implicit-dependencies
import {
  Model,
  property,
  length,
  pushKey,
  fk,
  model,
  ownedBy,
  hasMany
} from "firemodel";
import { Company } from "./Company";
import { IDictionary } from "common-types";

@model({ dbOffset: "authenticated" })
export class Person extends Model {
  // prettier-ignore
  @property @length(20) public name: string;
  @property public age?: number;
  @property public gender?: "male" | "female" | "other";
  @property public favoriteColor?: string;
  @property public scratchpad?: IDictionary;
  // prettier-ignore
  @property @pushKey public tags?: IDictionary<string>;

  // prettier-ignore
  @ownedBy(() => Person, "children") public motherId?: fk;
  // prettier-ignore
  @ownedBy(() => Person, "children") public fatherId?: fk;
  // prettier-ignore
  @hasMany(() => Person) public children?: IDictionary;
  // prettier-ignore
  @ownedBy(() => Company) public employerId?: fk;
}
