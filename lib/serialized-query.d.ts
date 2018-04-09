import { rtdb } from "firebase-api-surface";
export interface ISimplifiedDBAdaptor {
    ref: (path: string) => any;
}
export declare type LazyPath = () => string;
export declare function slashNotation(path: string): string;
export declare type IComparisonOperator = "=" | ">" | "<";
export declare type IConditionAndValue = [IComparisonOperator, boolean | string | number];
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
    limitToFirst(num: number): this;
    limitToLast(num: number): this;
    orderByChild(child: keyof T): this;
    orderByValue(): this;
    orderByKey(): this;
    startAt(value: any, key?: string): this;
    endAt(value: any, key?: string): this;
    equalTo(value: any, key?: string): this;
    setDB(db: ISimplifiedDBAdaptor): this;
    deserialize(db?: ISimplifiedDBAdaptor): any;
    handleSnapshot(fn: (snap: rtdb.IDataSnapshot) => any): this;
    execute(): Promise<any>;
    where<V>(operation: IComparisonOperator, value: V): this;
    toJSON(): string;
    toString(): string;
    private validateNoKey(caller, key);
}
