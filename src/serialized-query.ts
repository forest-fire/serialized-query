// tslint:disable:no-implicit-dependencies
export interface ISimplifiedDBAdaptor {
  ref: (path: string) => any;
}

export type DataSnapshot = import("@firebase/database-types").DataSnapshot;

export type LazyPath = () => string;

export function slashNotation(path: string) {
  return path.replace(/\./g, "/");
}

export interface ISerializedQueryIdentity<T = any> {
  orderBy: IOrderByType;
  orderByKey?: keyof T;
  limitToFirst?: number;
  limitToLast?: number;
  startAt?: string;
  endAt?: string;
  equalTo?: string;
  path: string;
}

export type IOrderByType =
  | "orderByChild"
  | "orderByKey"
  | "orderByValue"
  | "orderByValue";

export type IComparisonOperator = "=" | ">" | "<";
export type IConditionAndValue = [IComparisonOperator, boolean | string | number];

/**
 * Provides a way to serialize the full characteristics of a
 * Firebase query
 */
export class SerializedQuery<T = any> {
  public static path<T = any>(path: string | LazyPath = "/") {
    return new SerializedQuery<T>(path);
  }
  public db: ISimplifiedDBAdaptor;
  protected _path: string | LazyPath;
  protected _limitToFirst: number;
  protected _limitToLast: number;
  protected _orderBy: IOrderByType = "orderByKey";
  protected _orderKey: keyof T;
  protected _startAt: string;
  protected _endAt: string;
  protected _equalTo: string;

  protected _handleSnapshot: (snap: DataSnapshot) => any;

  constructor(path: string | LazyPath = "/") {
    this._path = typeof path === "string" ? slashNotation(path) : path;
  }

  public get path() {
    return this._path;
  }

  public setPath(path: string | LazyPath) {
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
    this.validateNoKey("startAt", key);
    this._startAt = value;
    return this;
  }

  public endAt(value: any, key?: string) {
    this.validateNoKey("endAt", key);
    this._endAt = value;
    return this;
  }

  public equalTo(value: any, key?: string) {
    this.validateNoKey("equalTo", key);
    this._equalTo = value;
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
   * generate a Firebase query from serialized state
   */
  public deserialize(db?: ISimplifiedDBAdaptor) {
    if (!db) {
      db = this.db;
    }
    let q = db.ref(
      typeof this._path === "function" ? slashNotation(this._path()) : this._path
    );
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
      q = q.startAt(this._startAt);
    }
    if (this._endAt) {
      q = q.endAt(this._endAt);
    }

    if (this._equalTo) {
      q = q.equalTo(this._equalTo);
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
  public where<V>(operation: IComparisonOperator, value: V) {
    switch (operation) {
      case "=":
        return this.equalTo(value);
      case ">":
        return this.startAt(value);
      case "<":
        return this.endAt(value);
      default:
        const e: any = new Error(`Unknown comparison operator: ${operation}`);
        e.code = "invalid-operator";
        throw e;
    }
  }

  public get identity(): ISerializedQueryIdentity<T> {
    return {
      orderBy: this._orderBy,
      orderByKey: this._orderKey,
      limitToFirst: this._limitToFirst,
      limitToLast: this._limitToLast,
      startAt: this._startAt,
      endAt: this._endAt,
      equalTo: this._equalTo,
      path: typeof this._path === "function" ? (this._path() as string) : this._path
    };
  }

  public toJSON() {
    return this.identity;
  }

  public toString() {
    return JSON.stringify(this.identity, null, 2);
  }

  private validateNoKey(caller: string, key: string) {
    if (key && this._orderBy === "orderByKey") {
      throw new Error(
        `You can not use the "key" parameter with ${caller}() when using the ${
          this._orderBy
        } sort.`
      );
    }
  }
}
