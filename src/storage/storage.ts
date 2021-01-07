import { Namespace } from './namespaces';

export interface IStorage {
    names: string[];
    namespaces: {
        [key: string]: Namespace;
        '##global##': Namespace;
    };
    keys: {
        [key: string]: string;
    };
    properties: {
        [key: string]: {
            key: string;
            namespace: string;
            predicate: string;
        }[];
    };
}

export class Storage {
    private static _global: IStorage = {
        names: [],
        namespaces: {
            '##global##': {},
        },
        keys: {},
        properties: {},
    };

    static get global() {
        return Storage._global;
    }
}
