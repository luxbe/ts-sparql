interface IStorage {
    names: string[];
}

export class Storage {
    private static _global: IStorage = {
        names: [],
    };

    static get global() {
        return Storage._global;
    }
}
