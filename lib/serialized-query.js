"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
function slashNotation(path) {
    return path.replace(/\./g, "/");
}
exports.slashNotation = slashNotation;
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
        this.validateNoKey("startAt", key);
        this._startAt = value;
        return this;
    }
    endAt(value, key) {
        this.validateNoKey("endAt", key);
        this._endAt = value;
        return this;
    }
    equalTo(value, key) {
        this.validateNoKey("equalTo", key);
        this._equalTo = value;
        return this;
    }
    /** Allows the DB interface to be setup early, allowing clients to call execute without any params */
    setDB(db) {
        this.db = db;
        return this;
    }
    /** generate a Firebase query from serialized state */
    deserialize(db) {
        if (!db) {
            db = this.db;
        }
        let q = db.ref(typeof this._path === "function" ? slashNotation(this._path()) : this._path);
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
    handleSnapshot(fn) {
        this._handleSnapshot = fn;
        return this;
    }
    /** execute the query as a one time fetch */
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            const snap = yield this.deserialize().once("value");
            return this._handleSnapshot ? this._handleSnapshot(snap) : snap;
        });
    }
    /** allows a shorthand notation for simple serialized queries */
    where(operation, value) {
        switch (operation) {
            case "=":
                return this.equalTo(value);
            case ">":
                return this.startAt(value);
            case "<":
                return this.endAt(value);
            default:
                const e = new Error(`Unknown comparison operator: ${operation}`);
                e.code = "invalid-operator";
                throw e;
        }
    }
    toJSON() {
        return JSON.stringify({
            orderBy: this._orderBy,
            orderByKey: this._orderKey,
            limitToFirst: this._limitToFirst,
            limitToLast: this._limitToLast,
            startAt: this._startAt,
            endAt: this._endAt,
            equalTo: this._equalTo,
            path: this._path
        });
    }
    hashCode() {
        const identity = this.toJSON();
        let hash = 0;
        if (identity.length === 0) {
            return hash;
        }
        for (let i = 0; i < identity.length; i++) {
            const char = identity.charCodeAt(i);
            // tslint:disable:no-bitwise
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    }
    toString() {
        return JSON.stringify({
            orderBy: this._orderBy,
            orderByKey: this._orderKey,
            limitToFirst: this._limitToFirst,
            limitToLast: this._limitToLast,
            startAt: this._startAt,
            endAt: this._endAt,
            equalTo: this._equalTo,
            path: this._path
        }, null, 2);
    }
    validateNoKey(caller, key) {
        if (key && this._orderBy === "orderByKey") {
            throw new Error(`You can not use the "key" parameter with ${caller}() when using the ${this._orderBy} sort.`);
        }
    }
}
exports.SerializedQuery = SerializedQuery;
//# sourceMappingURL=serialized-query.js.map