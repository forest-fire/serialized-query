import { IDictionary } from "common-types";
export type DataSnapshot = import("@firebase/database-types").DataSnapshot;
export interface ISimplifiedDBAdaptor {
  ref: (path: string) => any;
}

export function slashNotation(path: string) {
  return path.replace(/\./g, "/");
}

export interface ISerializedQueryIdentity<T = IDictionary> {
  orderBy: IQueryOrderType;
  orderByKey?: keyof T;
  limitToFirst?: number;
  limitToLast?: number;
  startAt?: string;
  startAtKey?: string;
  endAt?: string;
  endAtKey?: string;
  equalTo?: string;
  equalToKey?: string;
  path: string;
}

export enum QueryOrderType {
  orderByChild = "orderByChild",
  orderByKey = "orderByKey",
  orderByValue = "orderByValue"
}

export type IQueryOrderType = keyof typeof QueryOrderType;

export type IComparisonOperator = "=" | ">" | "<";
export type IConditionAndValue = [
  IComparisonOperator,
  boolean | string | number
];

/**
 * Provides a way to serialize the full characteristics of a
 * Firebase query
 */
export class SerializedQuery<T = IDictionary> {
  public static path<T extends object = IDictionary>(path: string = "/") {
    return new SerializedQuery<T>(path);
  }
  public db: ISimplifiedDBAdaptor;
  protected _path: string;
  protected _limitToFirst: number;
  protected _limitToLast: number;

  protected _orderBy: IQueryOrderType = "orderByKey";
  protected _orderKey: keyof T;

  protected _startAt: string;
  protected _startAtKey?: string;
  protected _endAt: string;
  protected _endAtKey?: string;
  protected _equalTo: string;
  protected _equalToKey?: string;
  protected _handleSnapshot: (snap: DataSnapshot) => any;

  constructor(path: string = "/") {
    this._path = typeof path === "string" ? slashNotation(path) : path;
  }

  public get path() {
    return this._path;
  }

  public setPath(path: string) {
    this._path = typeof path === "string" ? slashNotation(path) : path;
    return this;
  }

  /**
   * hashCode
   *
   * get a unique numeric hashcode for this query
   */
  public hashCode() {
    const identity = JSON.stringify(this.identity);
    let hash = 0;
    if (identity.length === 0) {
      return hash;
    }
    for (let i = 0; i < identity.length; i++) {
      const char = identity.charCodeAt(i);
      // tslint:disable:no-bitwise
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
  }

  public limitToFirst(num: number) {
    this._limitToFirst = num;
    return this;
  }

  public limitToLast(num: number) {
    this._limitToLast = num;
    return this;
  }

  public orderByChild(child: keyof T) {
    this._orderBy = "orderByChild";
    this._orderKey = child;
    return this;
  }

  public orderByValue() {
    this._orderBy = "orderByValue";
    return this;
  }

  public orderByKey() {
    this._orderBy = "orderByKey";
    return this;
  }

  public startAt(value: any, key?: string) {
    this.validateKey("startAt", key, [
      QueryOrderType.orderByChild,
      QueryOrderType.orderByValue
    ]);
    this._startAt = value;
    this._startAtKey = key;

    return this;
  }

  public endAt(value: any, key?: string) {
    this.validateKey("endAt", key, [
      QueryOrderType.orderByChild,
      QueryOrderType.orderByValue
    ]);
    this._endAt = value;
    this._endAtKey = key;

    return this;
  }

  public equalTo(value: any, key?: string) {
    this.validateKey("equalTo", key, [
      QueryOrderType.orderByChild,
      QueryOrderType.orderByValue
    ]);
    this._equalTo = value;
    this._equalToKey = key;

    return this;
  }

  /**
   * Allows the DB interface to be setup early, allowing clients
   * to call execute without any params
   */
  public setDB(db: ISimplifiedDBAdaptor) {
    this.db = db;
    return this;
  }

  /**
   * Generates a Firebase `Query` from the _state_ in
   * this serialized query
   */
  public deserialize(db?: ISimplifiedDBAdaptor) {
    if (!db) {
      db = this.db;
    }
    let q = db.ref(this._path);
    switch (this._orderBy) {
      case "orderByKey":
        q = q.orderByKey();
        break;
      case "orderByValue":
        q = q.orderByValue();
        break;
      case "orderByChild":
        q = q.orderByChild(this._orderKey);
        break;
    }
    if (this._limitToFirst) {
      q = q.limitToFirst(this._limitToFirst);
    }
    if (this._limitToLast) {
      q = q.limitToLast(this._limitToLast);
    }
    if (this._startAt) {
      q = q.startAt(this._startAt, this._startAtKey);
    }
    if (this._endAt) {
      q = q.endAt(this._endAt, this._endAtKey);
    }

    if (this._equalTo) {
      q = q.equalTo(this._equalTo, this._equalToKey);
    }

    return q;
  }

  /** allows you to add a handler/transformer for snapshots with the results of the execute() method */
  public handleSnapshot(fn: (snap: DataSnapshot) => any) {
    this._handleSnapshot = fn;
    return this;
  }

  /** execute the query as a one time fetch */
  public async execute() {
    const snap = await this.deserialize().once("value");
    return this._handleSnapshot ? this._handleSnapshot(snap) : snap;
  }

  /** allows a shorthand notation for simple serialized queries */
  public where<V>(operation: IComparisonOperator, value: V, key?: string) {
    switch (operation) {
      case "=":
        return this.equalTo(value, key);
      case ">":
        return this.startAt(value, key);
      case "<":
        return this.endAt(value, key);
      default:
        const e: any = new Error(`Unknown comparison operator: ${operation}`);
        e.code = "invalid-operator";
        throw e;
    }
  }

  public get identity(): ISerializedQueryIdentity<T> {
    return {
      orderBy: this._orderBy,
      /** the property/key when using the `OrderByChild` sorting */
      orderByKey: this._orderKey,
      limitToFirst: this._limitToFirst,
      limitToLast: this._limitToLast,
      startAt: this._startAt,
      startAtKey:
        this._startAtKey || this._orderBy === "orderByChild"
          ? (this._orderKey as string)
          : undefined,
      endAt: this._endAt,
      endAtKey:
        this._endAtKey || this._orderBy === "orderByChild"
          ? (this._orderKey as string)
          : undefined,
      equalTo: this._equalTo,
      equalToKey:
        this._equalToKey || this._orderBy === "orderByChild"
          ? (this._orderKey as string)
          : undefined,
      path: this._path
    };
  }

  public toJSON() {
    return this.identity;
  }

  public toString() {
    return JSON.stringify(this.identity, null, 2);
  }

  /**
   * Ensures that when a `key` is passed in as part of the query
   * modifiers -- such as "startAt", "endAt", etc. -- that the
   * sorting strategy is valid.
   *
   * @param caller gives a simple string name for the method
   * which is currently being called to modify the search filters
   * @param key the key value that _might_ have been erroneously passed in
   */
  private validateKey(caller: string, key: string, allowed: IQueryOrderType[]) {
    if (key && !allowed.includes(this._orderBy)) {
      throw new Error(
        `You can not use the "key" parameter with ${caller}() when using a "${
          this._orderBy
        }" sort. Valid ordering strategies are: ${allowed.join(", ")}`
      );
    }
  }
}
