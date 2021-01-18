import { Namespace } from './namespaces';

export interface Property {
    key: string;
    namespace: string;
    predicate: string;
}

export interface IStorage {
    names: string[];
    namespaces: Namespace;
    entities: {
        [key: string]: ObjectStorage;
    };
}

export interface ObjectStorage {
    name: string;
    idKey: string;
    properties: Property[];
    namespaces: Namespace;
}

export class Storage {
    private static _global: IStorage = {
        names: [],
        namespaces: {},
        entities: {},
    };

    static get global() {
        return Storage._global;
    }
}
