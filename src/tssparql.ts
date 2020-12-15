import { Storage } from './storage/storage';

interface TsSparqlOptions {
    url: string;
}

export class TsSparql {
    url: string;
    storage: Storage;

    static init(options: TsSparqlOptions) {
        return new TsSparql(options.url, Storage.global);
    }

    constructor(url: string, storage: Storage) {
        this.url = url;
        this.storage = storage;
    }
}
