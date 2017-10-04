export interface ISimplifiedDBAdaptor {
  ref: (path: string) => any;
}

export type LazyPath = () => string;

export function slashNotation(path: string) {
  return path.replace(/\./g, '/');
}

/**
 * Provides a way to serialize the full characteristics of a
 * Firebase query
 */
export class SerializedQuery<T = any> {
  public static path<T = any>(path: string | LazyPath) {
    const q = new SerializedQuery<T>(path);
    return q;
  }
  protected _db: ISimplifiedDBAdaptor;
  protected _path: string | LazyPath;
  protected _limitToFirst: number;
  protected _limitToLast: number;
  protected _orderBy: 'orderByChild' | 'orderByKey' | 'orderByValue' | 'orderByValue' = 'orderByKey';
  protected _orderKey: string;
  protected _startAt: string;
  protected _endAt: string;
  protected _equalTo: string;

  protected _handleSnapshot: (snap: FirebaseDataSnapshot) => any;

  constructor(path: string | LazyPath) {
    this._path = typeof path === 'string' ? slashNotation(path) : path;
  }

  public limitToFirst(num: number) {
    this._limitToFirst = num;
    return this;
  }

  public limitToLast(num: number) {
    this._limitToLast = num;
    return this;
  }

  public orderByChild(child: string) {
    this._orderBy = 'orderByChild';
    this._orderKey = child;
    return this;
  }

  public orderByValue() {
    this._orderBy = 'orderByValue';
    return this;
  }

  public orderByKey() {
    this._orderBy = 'orderByKey';
    return this;
  }

  public startAt(value: any, key?: string) {
    this.validateNoKey('startAt', key);
    this._startAt = value;
    return this;
  }

  public endAt(value: any, key?: string) {
    this.validateNoKey('endAt', key);
    this._endAt = value;
    return this;
  }

  public equalTo(value: any, key?: string) {
    this.validateNoKey('equalTo', key);
    this._equalTo = value;
    return this;
  }

  /** Allows the DB interface to be setup early, allowing clients to call execute without any params */
  public setDB(db: ISimplifiedDBAdaptor) {
    this._db = db;
    return this;
  }

  /** generate a Firebase query from serialized state */
  public deserialize(db?: ISimplifiedDBAdaptor) {
    if (!db) {
      db = this._db;
    }
    let q = db.ref(
      typeof this._path === 'function' ? slashNotation(this._path()) : this._path
    );
    switch (this._orderBy) {
      case 'orderByKey':
        q = q.orderByKey();
        break;
      case 'orderByValue':
        q = q.orderByValue();
        break;
      case 'orderByChild':
        q = q.orderByChild(this._orderKey);
        break;
    }
    if (this._limitToFirst) { q = q.limitToFirst(this._limitToFirst); }
    if (this._limitToLast) { q = q.limitToLast(this._limitToLast); }
    if (this._startAt) { q = q.startAt(this._startAt); }
    if (this._endAt) { q = q.endAt(this._endAt); }
    if (this._startAt) { q = q.startAt(this._startAt); }
    if (this._equalTo) { q = q.equalTo(this._equalTo); }

    return q as FirebaseQuery;
  }

  /** allows you to add a handler for snapshots when recieved from the execute() method */
  public handleSnapshot(fn: (snap: FirebaseDataSnapshot) => any) {
    this._handleSnapshot = fn;
  }

  /** execute the query as a one time fetch */
  public async execute(db?: ISimplifiedDBAdaptor) {
    if (!db) { db = this._db; }
    const snap = await this.deserialize(db).once('value');
    return this._handleSnapshot
      ? this._handleSnapshot(snap)
      : snap;
  }

  private validateNoKey(caller: string, key: string) {
    if (key && this._orderBy === 'orderByKey') {
      throw new Error(`You can not use the "key" parameter with ${caller}() when using the ${this._orderBy} sort.`);
    }
  }

}
