// tslint:disable:no-implicit-dependencies
import {
  Model,
  BaseSchema,
  property,
  constrainedProperty,
  constrain,
  desc,
  min,
  max,
  length,
  schema
} from "firemodel";

@schema({ dbOffset: "authenticated", audit: true })
export class Company extends BaseSchema {
  @property
  @length(20)
  public name: string;
  @property public employees?: number;
  @property public founded?: string;
}
