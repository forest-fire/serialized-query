import { IDictionary } from "common-types";
import { Query } from "@firebase/database-types";
export declare type DataSnapshot = import("@firebase/database-types").DataSnapshot;
export interface ISimplifiedDBAdaptor {
    ref: (path: string) => any;
}
export declare function slashNotation(path: string): string;
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
export declare enum QueryOrderType {
    orderByChild = "orderByChild",
    orderByKey = "orderByKey",
    orderByValue = "orderByValue"
}
export declare type IQueryOrderType = keyof typeof QueryOrderType;
export declare type IComparisonOperator = "=" | ">" | "<";
export declare type IConditionAndValue = [IComparisonOperator, boolean | string | number];
/**
 * Provides a way to serialize the full characteristics of a
 * Firebase query
 */
export declare class SerializedQuery<T = IDictionary> {
    static path<T extends object = IDictionary>(path?: string): SerializedQuery<T>;
    db: ISimplifiedDBAdaptor;
    protected _path: string;
    protected _limitToFirst: number;
    protected _limitToLast: number;
    protected _orderBy: IQueryOrderType;
    protected _orderKey: keyof T & string;
    protected _startAt: string;
    protected _startAtKey?: keyof T & string;
    protected _endAt: string;
    protected _endAtKey?: keyof T & string;
    protected _equalTo: string;
    protected _equalToKey?: keyof T & string;
    protected _handleSnapshot: (snap: DataSnapshot) => any;
    constructor(path?: string);
    get path(): string;
    setPath(path: string): this;
    /**
     * hashCode
     *
     * get a unique numeric hashcode for this query
     */
    hashCode(): number;
    limitToFirst(num: number): this;
    limitToLast(num: number): this;
    orderByChild(child: keyof T & string): this;
    orderByValue(): this;
    orderByKey(): this;
    startAt(value: any, key?: keyof T & string): this;
    endAt(value: any, key?: keyof T & string): this;
    equalTo(value: any, key?: keyof T & string): this;
    /**
     * Allows the DB interface to be setup early, allowing clients
     * to call execute without any params
     */
    setDB(db: ISimplifiedDBAdaptor): this;
    /**
     * Generates a Firebase `Query` from the _state_ in
     * this serialized query
     */
    deserialize(db?: ISimplifiedDBAdaptor): Query;
    /** allows you to add a handler/transformer for snapshots with the results of the execute() method */
    handleSnapshot(fn: (snap: DataSnapshot) => any): this;
    /** execute the query as a one time fetch */
    execute(): Promise<any>;
    /** allows a shorthand notation for simple serialized queries */
    where<V>(operation: IComparisonOperator, value: V, key?: keyof T & string): this;
    get identity(): ISerializedQueryIdentity<T>;
    toJSON(): ISerializedQueryIdentity<T>;
    toString(): string;
    /**
     * Ensures that when a `key` is passed in as part of the query
     * modifiers -- such as "startAt", "endAt", etc. -- that the
     * sorting strategy is valid.
     *
     * @param caller gives a simple string name for the method
     * which is currently being called to modify the search filters
     * @param key the key value that _might_ have been erroneously passed in
     */
    private validateKey;
}
