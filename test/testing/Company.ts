// tslint:disable:no-implicit-dependencies
import { Model, property, length, model } from "firemodel";

@model({ dbOffset: "authenticated", audit: true })
export class Company extends Model {
  // prettier-ignore
  @property @length(20) public name: string;
  @property public employees?: number;
  @property public founded?: string;
}
