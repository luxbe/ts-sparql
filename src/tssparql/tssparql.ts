import { Storage } from '../storage/storage';

interface TsSparqlOptions {
    url?: string;
    host?: string;
    port?: number;
    repository: string;
}

export class TsSparql {
    url: string;
    storage: Storage;

    static init(options: TsSparqlOptions) {
        if (!options.url) {
            if (!options.host && !options.url)
                throw new Error(`Expected either 'url' or 'host' and 'port'`);
            options.url = `${options.host}:${options.port}/`;
        }
        if (options.url.charAt(options.url.length - 1) !== '/')
            options.url += '/';

        options.url += `repositories/${options.repository}/statements`;
        return new TsSparql(options.url, Storage.global);
    }

    constructor(url: string, storage: Storage) {
        this.url = url;
        this.storage = storage;
    }

    save<T>(entity: T) {
        console.log(typeof entity);
    }
}
