import { Connection, Response } from './connection';
import { isIEntity } from './decorators/entity';
import { Attribute, Mapper } from './mapper';
import { Storage } from './storage';

interface Options {
    url?: string;
    host?: string;
    port?: number;
    repository: string;
}

interface SaveOptions {
    graph?: string;
    name?: string;
}

export class TsSparql {
    private static storage: typeof Storage['global'];
    private static mapper: Mapper;
    private static connection?: Connection;

    static init() {
        TsSparql.storage = Storage.global;
        TsSparql.mapper = new Mapper();
        return new TsSparql();
    }

    static async connect(options: Options, callback?: (err?: any) => void) {
        if (!options.url) {
            if (!options.host && !options.url)
                throw new Error(`Expected either 'url' or 'host' and 'port'`);
            options.url = `${options.host}:${options.port}/`;
        }

        if (!/^http:\/\//.test(options.url))
            options.url = `http://${options.url}`;

        await Connection.init({
            url: options.url,
            repository: options.repository,
        })
            .then((connection) => {
                TsSparql.connection = connection;
                if (callback) callback();
            })
            .catch((err) => {
                if (!!!callback)
                    throw new Error(`Could not connect to database: ${err}`);
                callback(err);
            });
    }

    save<T extends object>(entity: T, options: SaveOptions = {}): Promise<T> {
        if (!!!TsSparql.connection) throw new Error('No connection configured');

        return new Promise((resolve, reject) => {
            if (!isIEntity(entity))
                throw new Error(
                    `Target ${entity.constructor.name} is not an Entity`,
                );

            // check name
            options.name ||= entity.__tssparql__.name;

            if (!Object.keys(TsSparql.storage.entities).includes(options.name))
                throw new Error(`Target ${options.name} is not an Entity`);
            // get id
            const idKey = entity.__tssparql__.idKey;
            const id = (entity as any)[idKey];
            // get namespaces
            const namespaces = {
                ...TsSparql.storage.entities[options.name].namespaces,
                ...TsSparql.storage.namespaces,
            };
            // get properties
            const properties = entity.__tssparql__.properties;
            if (!properties.length)
                throw new Error('Entity does not have any properties');
            const attributes: Attribute[] = [
                {
                    predicate: 'a',
                    object:
                        options.name +
                        ':' +
                        (options.name.charAt(0).toUpperCase() +
                            options.name.slice(1)),
                    type: 'LITERAL',
                },
                ...properties.map<Attribute>(
                    ({ key, predicate, namespace }) => {
                        return {
                            predicate: namespace + ':' + predicate,
                            object: (entity as any)[key],
                            type: 'STRING',
                        };
                    },
                ),
            ];
            const sparql = TsSparql.mapper
                .graph(options.graph)
                .subject(`${options.name}:${id}`)
                .assign(attributes)
                .namespaces(namespaces)
                .sparql('INSERT');
            TsSparql.connection!.post(sparql)
                .then((entity) => resolve(entity))
                .catch((err) => reject(err));
        });
    }

    getOne<T extends object>(name: string, id: string): Promise<T | undefined> {
        if (!!!TsSparql.connection) throw new Error('No connection configured');
        return new Promise((resolve, reject) => {
            // check name
            if (!Object.keys(TsSparql.storage.entities).includes(name))
                throw new Error(`Target ${name} is not an Entity`);

            const entity: { [key: string]: any } = {};
            // set id
            const idKey = TsSparql.storage.entities[name].idKey;
            entity[idKey] = id;
            // get namespaces
            const namespaces = {
                ...TsSparql.storage.entities[name].namespaces,
                ...TsSparql.storage.namespaces,
            };
            // set properties
            const _properties = TsSparql.storage.entities[name].properties;
            const properties: Attribute[] = [
                {
                    predicate: 'a',
                    object:
                        name +
                        ':' +
                        (name.charAt(0).toUpperCase() + name.slice(1)),
                    type: 'LITERAL',
                },
                ..._properties.map<Attribute>(
                    ({ key, predicate, namespace }) => {
                        return {
                            predicate: namespace + ':' + predicate,
                            object: `?${key}`,
                            type: 'LITERAL',
                        };
                    },
                ),
            ];
            const sparql = TsSparql.mapper
                .subject(`${name}:${id}`)
                .assign(properties)
                .namespaces(namespaces)
                .sparql('SELECT');
            TsSparql.connection!.get(sparql)
                .then((res) => {
                    if (res.results.bindings.length === 0)
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

    getAll<T extends object>(name: string): Promise<T[] | undefined> {
        if (!!!TsSparql.connection) throw new Error('No connection configured');

        return new Promise((resolve, reject) => {
            // check name
            if (!Object.keys(TsSparql.storage.entities).includes(name))
                throw new Error(`Target ${name} is not an Entity`);

            // set id
            const idKey = TsSparql.storage.entities[name].idKey;

            // get namespaces
            const namespaces = {
                ...TsSparql.storage.entities[name].namespaces,
                ...TsSparql.storage.namespaces,
            };
            // set properties
            const _properties = TsSparql.storage.entities[name].properties;
            const properties: Attribute[] = [
                {
                    predicate: 'a',
                    object:
                        name +
                        ':' +
                        (name.charAt(0).toUpperCase() + name.slice(1)),
                    type: 'LITERAL',
                },
                ..._properties.map<Attribute>(
                    ({ key, predicate, namespace }) => {
                        return {
                            predicate: namespace + ':' + predicate,
                            object: `?${key}`,
                            type: 'LITERAL',
                        };
                    },
                ),
            ];

            const sparql = TsSparql.mapper
                .subject('?id')
                .assign(properties)
                .namespaces(namespaces)
                .sparql('SELECT');

            TsSparql.connection!.get(sparql)
                .then((res) => {
                    if (res.results.bindings.length === 0)
                        return resolve(undefined);
                    const entities = res.results.bindings.map((_o) => {
                        const entity: { [key: string]: any } = {};
                        entity[idKey] = _o[idKey].value.replace(/.*#/, '');
                        _properties.forEach(({ key }) => {
                            entity[key] = _o[key].value;
                        });
                        return entity as T;
                    });
                    resolve(entities);
                })
                .catch((err) => reject(err));
        });
    }
}
