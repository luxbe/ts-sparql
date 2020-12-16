export interface IPrefixes {
    [key: string]: string;
}

export interface IStorage {
    names: string[];
    prefixes: {
        [key: string]: IPrefixes;
    };
    ids: {
        [key: string]: string;
    };
    properties: {
        [key: string]: {
            key: string;
            prefix?: string;
            literal: boolean;
        }[];
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
