import { ISnapShot } from "typed-conversions";
export interface ISimplifiedDBAdaptor {
    ref: (path: string) => any;
}
export declare type LazyPath = () => string;
export declare function slashNotation(path: string): string;
export declare class SerializedQuery<T = any> {
    static path<T = any>(path?: string | LazyPath): SerializedQuery<T>;
    protected _db: ISimplifiedDBAdaptor;
    protected _path: string | LazyPath;
    protected _limitToFirst: number;
    protected _limitToLast: number;
    protected _orderBy: "orderByChild" | "orderByKey" | "orderByValue" | "orderByValue";
    protected _orderKey: string;
    protected _startAt: string;
    protected _endAt: string;
    protected _equalTo: string;
    protected _handleSnapshot: (snap: ISnapShot) => any;
    constructor(path: string | LazyPath);
    readonly path: string | LazyPath;
    limitToFirst(num: number): this;
    limitToLast(num: number): this;
    orderByChild(child: string): this;
    orderByValue(): this;
    orderByKey(): this;
    startAt(value: any, key?: string): this;
    endAt(value: any, key?: string): this;
    equalTo(value: any, key?: string): this;
    setDB(db: ISimplifiedDBAdaptor): this;
    deserialize(db?: ISimplifiedDBAdaptor): any;
    handleSnapshot(fn: (snap: ISnapShot) => any): this;
    execute(): Promise<any>;
    toJSON(): string;
    toString(): string;
    private validateNoKey(caller, key);
}
