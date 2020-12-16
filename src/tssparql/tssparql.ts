import { isValidRegex } from '../helper';
import { IPrefixes, IStorage, Storage } from '../storage/storage';
import { Relation, SparqlMapper } from './sparql.mapper';

interface TsSparqlOptions {
    url?: string;
    host?: string;
    port?: number;
    defaultVoc?: string;
    repository: string;
}

export class TsSparql {
    url: string;
    storage: IStorage;
    mapper: SparqlMapper;
    defaultVoc: string;
    private _prefixes: IPrefixes;
    private _graph?: string;

    static init(options: TsSparqlOptions) {
        if (!options.url) {
            if (!options.host && !options.url)
                throw new Error(`Expected either 'host' and 'port' or 'url'`);
            options.url = `${options.host}:${options.port}/`;
        }
        if (options.defaultVoc && !isValidRegex(options.defaultVoc, '/:#'))
            throw new Error(`'${options.defaultVoc}' does not match RegExp`);

        if (options.url.charAt(options.url.length - 1) !== '/')
            options.url += '/';

        options.url += `repositories/${options.repository}/statements`;
        return new TsSparql(options.url, Storage.global, options.defaultVoc);
    }

    constructor(url: string, storage: IStorage, defaultVoc: string = '') {
        this.url = url;
        this.storage = storage;
        this.mapper = new SparqlMapper();
        this.defaultVoc = defaultVoc;
        this._prefixes = {};
    }

    prefixes(prefixes: IPrefixes) {
        this._prefixes = prefixes;
        return this;
    }

    graph(graph: string) {
        this._graph = graph;
        return this;
    }

    save<T extends { [key: string]: any }>(entity: T) {
        // get name
        const name = entity.constructor.name.toLowerCase();
        if (!this.storage.names.includes(name))
            throw new Error('Entity was not defined');

        // get id
        const idKey = this.storage.ids[name];
        if (!idKey) throw new Error('Entity does not have an Id');
        const id = entity[idKey];

        // get prefixes
        const _prefixes = this.storage.prefixes[name];

        // get properties
        const propertyKeys = this.storage.properties[name];
        if (!propertyKeys.length)
            throw new Error('Entity does not have any properties');

        const properties: Relation[] = [];
        propertyKeys.forEach((p) =>
            properties.push({
                predicate: (p.prefix || this.defaultVoc) + ':' + p.key,
                object: entity[p.key],
                literal: p.literal,
            }),
        );

        const sparql = this.mapper
            .subject(name + ':' + 'id')
            .assign(properties)
            .sparql('INSERT', this._graph, _prefixes, this._prefixes);

        return this;
    }
}
