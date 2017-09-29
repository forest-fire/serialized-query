"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SerializedQuery {
    constructor(path) {
        this._orderBy = 'orderByKey';
        this._path = path;
    }
    static path(path) {
        const q = new SerializedQuery(path);
        return q;
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
        this._orderBy = 'orderByChild';
        this._orderKey = child;
        return this;
    }
    orderByValue() {
        this._orderBy = 'orderByValue';
        return this;
    }
    orderByKey() {
        this._orderBy = 'orderByKey';
        return this;
    }
    startAt(value, key) {
        this.noKeyOnKeySort('startAt', key);
        this._startAt = value;
        return this;
    }
    endAt(value, key) {
        this.noKeyOnKeySort('endAt', key);
        this._endAt = value;
        return this;
    }
    equalTo(value, key) {
        this.noKeyOnKeySort('equalTo', key);
        this._equalTo = value;
        return this;
    }
    execute(db) {
        let q = db.ref(typeof this._path === 'function' ? this._path() : this._path);
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
        if (this._startAt) {
            q = q.startAt(this._startAt);
        }
        if (this._equalTo) {
            q = q.equalTo(this._equalTo);
        }
        return q;
    }
    noKeyOnKeySort(caller, key) {
        if (key && this._orderBy === 'orderByKey') {
            throw new Error(`You can not use the "key" parameter with ${caller}() when using the ${this._orderBy} sort.`);
        }
    }
}
exports.SerializedQuery = SerializedQuery;
//# sourceMappingURL=serialized-query.js.map