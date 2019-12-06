"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function slashNotation(path) {
    return path.replace(/\./g, "/");
}
exports.slashNotation = slashNotation;
var QueryOrderType;
(function (QueryOrderType) {
    QueryOrderType["orderByChild"] = "orderByChild";
    QueryOrderType["orderByKey"] = "orderByKey";
    QueryOrderType["orderByValue"] = "orderByValue";
})(QueryOrderType = exports.QueryOrderType || (exports.QueryOrderType = {}));
/**
 * Provides a way to serialize the full characteristics of a
 * Firebase query
 */
class SerializedQuery {
    constructor(path = "/") {
        this._orderBy = "orderByKey";
        this._path = typeof path === "string" ? slashNotation(path) : path;
    }
    static path(path = "/") {
        return new SerializedQuery(path);
    }
    get path() {
        return this._path;
    }
    setPath(path) {
        this._path = typeof path === "string" ? slashNotation(path) : path;
        return this;
    }
    /**
     * hashCode
     *
     * get a unique numeric hashcode for this query
     */
    hashCode() {
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
    limitToFirst(num) {
        this._limitToFirst = num;
        return this;
    }
    limitToLast(num) {
        this._limitToLast = num;
        return this;
    }
    orderByChild(child) {
        this._orderBy = "orderByChild";
        this._orderKey = child;
        return this;
    }
    orderByValue() {
        this._orderBy = "orderByValue";
        return this;
    }
    orderByKey() {
        this._orderBy = "orderByKey";
        return this;
    }
    startAt(value, key) {
        this.validateKey("startAt", key, [
            QueryOrderType.orderByChild,
            QueryOrderType.orderByValue
        ]);
        this._startAt = value;
        this._startAtKey = key;
        return this;
    }
    endAt(value, key) {
        this.validateKey("endAt", key, [
            QueryOrderType.orderByChild,
            QueryOrderType.orderByValue
        ]);
        this._endAt = value;
        this._endAtKey = key;
        return this;
    }
    equalTo(value, key) {
        this._equalTo = value;
        this._equalToKey = key;
        this.validateKey("equalTo", key, [
            QueryOrderType.orderByChild,
            QueryOrderType.orderByValue
        ]);
        return this;
    }
    /**
     * Allows the DB interface to be setup early, allowing clients
     * to call execute without any params
     */
    setDB(db) {
        this.db = db;
        return this;
    }
    /**
     * Generates a Firebase `Query` from the _state_ in
     * this serialized query
     */
    deserialize(db) {
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
                q = q.orderByChild(this.identity.orderByKey);
                break;
        }
        if (this._limitToFirst) {
            console.log("ltf");
            q = q.limitToFirst(this.identity.limitToFirst);
        }
        if (this._limitToLast) {
            console.log("ltl");
            q = q.limitToLast(this.identity.limitToLast);
        }
        if (this._startAt) {
            console.log("sa");
            q = q.startAt(this.identity.startAt, this.identity.startAtKey);
        }
        if (this._endAt) {
            console.log("ea");
            q = q.endAt(this.identity.endAt, this.identity.endAtKey);
        }
        console.log("equalTo:", this._equalTo);
        if (this._equalTo) {
            console.log("et", this.identity.equalTo, this.identity.equalToKey);
            q = q.equalTo(this.identity.equalTo, this.identity.equalToKey);
        }
        return q;
    }
    /** allows you to add a handler/transformer for snapshots with the results of the execute() method */
    handleSnapshot(fn) {
        this._handleSnapshot = fn;
        return this;
    }
    /** execute the query as a one time fetch */
    async execute() {
        const snap = await this.deserialize().once("value");
        return this._handleSnapshot ? this._handleSnapshot(snap) : snap;
    }
    /** allows a shorthand notation for simple serialized queries */
    where(operation, value, key) {
        switch (operation) {
            case "=":
                return this.equalTo(value, key);
            case ">":
                return this.startAt(value, key);
            case "<":
                return this.endAt(value, key);
            default:
                const e = new Error(`Unknown comparison operator: ${operation}`);
                e.code = "invalid-operator";
                throw e;
        }
    }
    get identity() {
        console.log(this._equalToKey);
        return {
            orderBy: this._orderBy,
            /** the property/key when using the `OrderByChild` sorting */
            orderByKey: this._orderKey,
            limitToFirst: this._limitToFirst,
            limitToLast: this._limitToLast,
            startAt: this._startAt,
            startAtKey: this._startAtKey
                ? this._startAtKey
                : this._orderBy === "orderByChild"
                    ? this._orderKey
                    : undefined,
            endAt: this._endAt,
            endAtKey: this._endAtKey
                ? this._endAtKey
                : this._orderBy === "orderByChild"
                    ? this._orderKey
                    : undefined,
            equalTo: this._equalTo,
            equalToKey: this._equalToKey
                ? this._equalToKey
                : this._orderBy === "orderByChild"
                    ? this._orderKey
                    : undefined,
            path: this._path
        };
    }
    toJSON() {
        return this.identity;
    }
    toString() {
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
    validateKey(caller, key, allowed) {
        console.log(key);
        console.log(this.identity);
        if (key && !allowed.includes(this._orderBy)) {
            throw new Error(`You can not use the "key" parameter with ${caller}() when using a "${this._orderBy}" sort. Valid ordering strategies are: ${allowed.join(", ")}`);
        }
    }
}
exports.SerializedQuery = SerializedQuery;
//# sourceMappingURL=serialized-query.js.map