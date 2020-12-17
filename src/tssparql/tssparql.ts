import { Client } from '../client/client';
import { isValidRegex } from '../helper';
import { IPrefixes, IStorage, Storage } from '../storage/storage';
import { Relation, SparqlMapper } from './sparql.mapper';
// import sa from 'superagent';

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
    private _client: Client;
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

        options.url += `repositories/${options.repository}`;
        return new TsSparql(options.url, Storage.global, options.defaultVoc);
    }

    constructor(url: string, storage: IStorage, defaultVoc: string = '') {
        this.url = url;
        this.storage = storage;
        this.mapper = new SparqlMapper();
        this.defaultVoc = defaultVoc;
        this._prefixes = {};
        this._client = new Client(url);
    }

    prefixes(prefixes: IPrefixes) {
        this._prefixes = prefixes;
        return this;
    }

    graph(graph: string) {
        this._graph = graph;
        return this;
    }

    save<T extends { [key: string]: any }>(entity: T): Promise<T> {
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

        const properties: Relation[] = [
            {
                predicate: 'a',
                object:
                    name + ':' + (name.charAt(0).toUpperCase() + name.slice(1)),
                literal: false,
            },
        ];
        propertyKeys.forEach((p) =>
            properties.push({
                predicate: (p.prefix || this.defaultVoc) + ':' + p.key,
                object: entity[p.key],
                literal: p.literal,
            }),
        );

        const sparql = this.mapper
            .subject(`${name}:${id}`)
            .assign(properties)
            .sparql('INSERT', this._graph, _prefixes, this._prefixes);

        return new Promise((resolve, reject) => {
            this._client
                .post(sparql)
                .then(() => resolve(entity))
                .catch((err) => reject(err));
        });
    }

    getOne<T extends object>(
        type: new (...args: any[]) => T,
        id: string,
    ): Promise<T | undefined> {
        return new Promise((resolve, reject) => {
            const name = type.name.toLowerCase();

            if (!this.storage.names.includes(name))
                throw new Error('Entity was not defined');
            let entity: { [key: string]: any } = {};

            // set id
            const id_key = this.storage.ids[name];
            entity[id_key] = id;

            // get prefixes
            const _prefixes = this.storage.prefixes[name];

            // set properties
            const _properties = this.storage.properties[name];
            const properties = [
                {
                    predicate: 'a',
                    object:
                        name +
                        ':' +
                        (name.charAt(0).toUpperCase() + name.slice(1)),
                    literal: false,
                },
                ..._properties.map(({ key, prefix }) => {
                    return {
                        literal: false,
                        predicate: `${prefix}:${key}`,
                        object: `?${key}`,
                    };
                }),
            ];

            const sparql = this.mapper
                .subject(`${name}:${id}`)
                .assign(properties)
                .sparql('SELECT', this._graph, _prefixes, this._prefixes);

            this._client
                .get(sparql)
                .then((res) => {
                    if (res.results.bindings.length == 0)
                        return resolve(undefined);
                    const _o = res.results.bindings[0];

                    _properties.forEach(({ key }) => {
                        entity[key] = _o[key].value;
                    });

                    resolve(entity as T);
                })
                .catch((err) => reject(err));
        });
    }
}
