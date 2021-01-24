import { EntityStorage, Storage } from '../interfaces';

export class Metadata {
    private static _instance: Metadata;
    public storage: Storage;
    private name?: string;

    private constructor() {
        this.storage = {
            entities: [],
            idKeys: {},
            types: {},
            properties: {},
            namespaces: {},
        };
    }

    public static get global() {
        if (!Metadata._instance) {
            Metadata._instance = new Metadata();
        }
        return Metadata._instance;
    }

    entityInstance<T extends object>(entity: T) {
        this.name = entity.constructor.name;

        if (!this.storage.entities.includes(this.name))
            throw new Error(`${this.name} is not an Entity`);

        return this;
    }

    public getMetadata<T>(): EntityStorage {
        if (this.name == undefined) throw new Error(`No name defined`);

        const idKey = this.storage.idKeys[this.name];
        const properties = (this.storage.properties[this.name] ||= []);
        const type = this.storage.types[this.name];
        const namespaces = this.storage.namespaces[this.name];

        return {
            name: this.name,
            idKey,
            properties,
            type,
            namespaces,
        };
    }
}
