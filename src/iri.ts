export class Iri {
    private _prefix?: string;
    private _predicate: string;
    private _validCharacterRegex = /[a-zA-Z0-9]+/;

    constructor(predicate: string, prefix?: string) {
        predicate = predicate.trim();
        // check if predicate is valid full iri
        if (/^https?:\/\/.+$/.test(predicate)) {
            this._predicate = predicate;
        } else {
            if (prefix === undefined) {
                const matches = predicate.match(
                    /([a-zA-Z0-9]+):([a-zA-Z0-9]+)/,
                );

                if (matches === undefined || matches === null)
                    throw new Error(`${predicate} is not a valid iri`);

                prefix = matches[1];
                predicate = matches[2];
            }

            prefix = prefix.trim();
            if (!this._validCharacterRegex.test(predicate))
                throw new Error(
                    `Predicate '${predicate}' contains illegal characters`,
                );
            if (!this._validCharacterRegex.test(prefix))
                throw new Error(
                    `Prefix '${prefix}' contains illegal characters`,
                );
            this._predicate = predicate;
            this._prefix = prefix;
        }
    }

    get prefix() {
        return this._prefix;
    }

    setPrefix(prefix: string) {
        this._prefix = prefix.trim();
        return this;
    }

    setPredicate(predicate: string) {
        this._predicate = predicate.trim();
        return this;
    }

    get predicate() {
        return this._predicate;
    }

    public toString() {
        return this._prefix
            ? this._prefix + ':' + this._predicate
            : this._predicate;
    }

    public toSparql() {
        return this._prefix
            ? this._prefix + ':' + this._predicate
            : '<' + this._predicate + '>';
    }
}
