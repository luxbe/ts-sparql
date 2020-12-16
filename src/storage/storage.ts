export interface IPrefixes {
    [key: string]: string;
}

interface IStorage {
    names: string[];
    prefixes: {
        [key: string]: IPrefixes;
    };
    ids: {
        [key: string]: string;
    };
    properties: {
        [key: string]: string[];
    };
}

export class Storage {
    private static _global: IStorage = {
        names: [],
        prefixes: {},
        ids: {},
        properties: {},
    };

    static get global() {
        return Storage._global;
    }
}
