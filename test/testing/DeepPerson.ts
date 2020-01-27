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

@model({ dbOffset: "authenticated/:group" })
export class DeepPerson extends Model {
  @property @length(20) name: string;
  @property age?: number;
  @property gender?: "male" | "female" | "other";
  @property favoriteColor?: string;
  @property scratchpad?: IDictionary;
  @property @pushKey tags?: IDictionary<string>;
  @property group: string;

  @ownedBy(() => DeepPerson, "children") motherId?: fk;
  @ownedBy(() => DeepPerson, "children") fatherId?: fk;
  @hasMany(() => DeepPerson) children?: IDictionary;
  @ownedBy(() => Company) employerId?: fk;
}
