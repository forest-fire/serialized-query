import { rtdb } from "firebase-api-surface";
export interface ISimplifiedDBAdaptor {
    ref: (path: string) => any;
}
export declare type LazyPath = () => string;
export declare function slashNotation(path: string): string;
export declare type IComparisonOperator = "=" | ">" | "<";
export declare type IConditionAndValue = [IComparisonOperator, boolean | string | number];
/**
 * Provides a way to serialize the full characteristics of a
 * Firebase query
 */
export declare class SerializedQuery<T = any> {
    static path<T = any>(path?: string | LazyPath): SerializedQuery<T>;
    db: ISimplifiedDBAdaptor;
    protected _path: string | LazyPath;
    protected _limitToFirst: number;
    protected _limitToLast: number;
    protected _orderBy: "orderByChild" | "orderByKey" | "orderByValue" | "orderByValue";
    protected _orderKey: keyof T;
    protected _startAt: string;
    protected _endAt: string;
    protected _equalTo: string;
    protected _handleSnapshot: (snap: rtdb.IDataSnapshot) => any;
    constructor(path?: string | LazyPath);
    readonly path: string | LazyPath;
    setPath(path: string | LazyPath): this;
    /**
     * hashCode
     *
     * get a unique numeric hashcode for this query
     */
    hashCode(): number;
    limitToFirst(num: number): this;
    limitToLast(num: number): this;
    orderByChild(child: keyof T): this;
    orderByValue(): this;
    orderByKey(): this;
    startAt(value: any, key?: string): this;
    endAt(value: any, key?: string): this;
    equalTo(value: any, key?: string): this;
    /** Allows the DB interface to be setup early, allowing clients to call execute without any params */
    setDB(db: ISimplifiedDBAdaptor): this;
    /** generate a Firebase query from serialized state */
    deserialize(db?: ISimplifiedDBAdaptor): any;
    /** allows you to add a handler/transformer for snapshots with the results of the execute() method */
    handleSnapshot(fn: (snap: rtdb.IDataSnapshot) => any): this;
    /** execute the query as a one time fetch */
    execute(): Promise<any>;
    /** allows a shorthand notation for simple serialized queries */
    where<V>(operation: IComparisonOperator, value: V): this;
    toJSON(): string;
    toString(): string;
    private validateNoKey;
}
