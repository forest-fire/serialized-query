/// <reference types="firebase" />
export interface ISimplifiedDBAdaptor {
    ref: (path: string) => any;
}
export declare type LazyPath = () => string;
export declare function slashNotation(path: string): string;
export declare class SerializedQuery {
    static path(path: string | LazyPath): SerializedQuery;
    protected _db: ISimplifiedDBAdaptor;
    protected _path: string | LazyPath;
    protected _limitToFirst: number;
    protected _limitToLast: number;
    protected _orderBy: 'orderByChild' | 'orderByKey' | 'orderByValue' | 'orderByValue';
    protected _orderKey: string;
    protected _startAt: string;
    protected _endAt: string;
    protected _equalTo: string;
    constructor(path: string | LazyPath);
    limitToFirst(num: number): this;
    limitToLast(num: number): this;
    orderByChild(child: string): this;
    orderByValue(): this;
    orderByKey(): this;
    startAt(value: any, key?: string): this;
    endAt(value: any, key?: string): this;
    equalTo(value: any, key?: string): this;
    setDB(db: ISimplifiedDBAdaptor): void;
    execute(db?: ISimplifiedDBAdaptor): FirebaseQuery;
    private validateNoKey(caller, key);
}
