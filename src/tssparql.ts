import { Connection } from './connection';
import { Attribute, Mapper } from './mapper';
import { Storage } from './storage';

interface Options {
    url?: string;
    host?: string;
    port?: number;
    repository: string;
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

    save<T extends object>(entity: T): Promise<void> {
        if (!!!TsSparql.connection) throw new Error('No connection configured');

        return new Promise((resolve, reject) => {
            // get name
            const name = entity.constructor.name.toLowerCase();
            if (!TsSparql.storage.names.includes(name))
                reject(`'${name}' is not an Entity`);

            // get id
            const idKey = TsSparql.storage.keys[name];
            const id = (entity as any)[idKey];

            // get namespaces
            const namespaces = {
                ...TsSparql.storage.namespaces[name],
                ...TsSparql.storage.namespaces['##global##'],
            };

            // get properties
            const propertyKeys = TsSparql.storage.properties[name];
            if (!propertyKeys.length)
                throw new Error('Entity does not have any properties');

            const attributes: Attribute[] = [
                {
                    predicate: 'a',
                    object:
                        name +
                        ':' +
                        (name.charAt(0).toUpperCase() + name.slice(1)),
                    type: 'LITERAL',
                },
                ...propertyKeys.map<Attribute>((p) => {
                    return {
                        predicate: p.namespace + ':' + p.predicate,
                        object: (entity as any)[p.key],
                        type: 'STRING',
                    };
                }),
            ];

            const sparql = TsSparql.mapper
                .subject(`${name}:${id}`)
                .assign(attributes)
                .namespaces(namespaces)
                .sparql('INSERT');

            TsSparql.connection!.post(sparql)
                .then(() => resolve())
                .catch((err) => reject(err));
        });
    }

    getOne<T extends object>(type: string, id: string): Promise<T | undefined> {
        if (!!!TsSparql.connection) throw new Error('No connection configured');
        return new Promise((resolve, reject) => {
            const name = type.toLowerCase();

            if (!TsSparql.storage.names.includes(name))
                throw new Error(`Entity '${name}' is not defined`);
            const entity: { [key: string]: any } = {};

            // set id
            const idKey = TsSparql.storage.keys[name];
            entity[idKey] = id;

            // get namespaces
            const namespaces = {
                ...TsSparql.storage.namespaces[name],
                ...TsSparql.storage.namespaces['##global##'],
            };

            // set properties
            const _properties = TsSparql.storage.properties[name];
            const properties: Attribute[] = [
                {
                    predicate: 'a',
                    object:
                        name +
                        ':' +
                        (name.charAt(0).toUpperCase() + name.slice(1)),
                    type: 'STRING',
                },
                ..._properties.map<Attribute>(
                    ({ key, predicate, namespace }) => {
                        return {
                            predicate,
                            object: `?${key}`,
                            type: 'STRING',
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
}
