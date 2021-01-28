export default class Iri {
    private _prefix: string;
    private _predicate: string;

    private constructor(prefix: string, predicate: string) {
        this._prefix = prefix;
        this._predicate = predicate;
    }

    static init(predicate: string, prefix?: string) {
        if (prefix != undefined) {
            return new Iri(prefix, predicate);
        }
        if (/<.+>/.test(predicate))
            return new Iri('', predicate.substr(1, predicate.length - 2));

        const matches = predicate.match(/(.+):([a-zA-Z0-9]+)/);
        if (matches == undefined)
            throw new Error(`${predicate} is not a valid iri`);

        return new Iri(matches[1], matches[2]);
    }

    get prefix() {
        return this._prefix;
    }

    setPrefix(prefix: string) {
        this._prefix = prefix;
        return this;
    }

    setPredicate(predicate: string) {
        this._predicate = predicate;
        return this;
    }

    get predicate() {
        return this._predicate;
    }

    public toString() {
        return this._prefix
            ? `${this._prefix}:${this._predicate}`
            : `${this._predicate}`;
    }
}
