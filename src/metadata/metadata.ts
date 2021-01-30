import { EntityStorage, Storage, Type } from '../interfaces';

export class Metadata {
    private static _instance: Metadata;
    public storage: Storage;
    private _name?: string;

    private constructor() {
        this.storage = {
            entities: [],
            idKeys: {},
            types: {},
            properties: {},
            namespaces: {},
            graphs: {},
            constructors: {},
        };
    }

    private set name(name: string) {
        if (!this.storage.entities.includes(name))
            throw new Error(`${name} is not an Entity`);
        this._name = name;
    }

    public static get global() {
        if (!Metadata._instance) {
            Metadata._instance = new Metadata();
        }
        return Metadata._instance;
    }

    entityType<T>(type: Type<T> | string) {
        if (typeof type === 'string') this.name = type;
        else this.name = type.name;
        return this;
    }

    entityInstance<T extends object>(entity: T) {
        this.name = entity.constructor.name;
        return this;
    }

    public getMetadata<T>(): EntityStorage {
        if (this._name === undefined) throw new Error(`No name defined`);

        const idKey = this.storage.idKeys[this._name];
        const properties = (this.storage.properties[this._name] ||= []);
        const graph = this.storage.graphs[this._name];
        const type = this.storage.types[this._name];
        const namespaces = this.storage.namespaces[this._name];

        return {
            name: this._name,
            idKey,
            properties,
            graph,
            type,
            namespaces,
        };
    }
}
