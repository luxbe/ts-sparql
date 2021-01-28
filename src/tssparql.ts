import { Client } from './client';
import { Property, Response, Type } from './interfaces';
import { Condition } from './interfaces/condition';
import Iri from './iri';
import { EntityMapper, SPARQLMapper } from './mapper';
import { Metadata } from './metadata';

interface Options {
    url?: string;
    host?: string;
    port?: number;
    repository: string;
}

export class TsSparql {
    private metadata: Metadata;
    private entityMapper: EntityMapper;
    private sparqlMapper: SPARQLMapper;
    private static client?: Client;

    static init() {
        return new TsSparql(
            Metadata.global,
            new SPARQLMapper(),
            EntityMapper.global,
        );
    }

    private constructor(
        metadata: Metadata,
        mapper: SPARQLMapper,
        entityMapper: EntityMapper,
    ) {
        this.metadata = metadata;
        this.sparqlMapper = mapper;
        this.entityMapper = entityMapper;
    }

    static connect(
        options: Options,
        // , callback?: (err?: any) => void
    ) {
        if (!options.url) {
            if (!options.host && !options.url)
                throw new Error(`Expected either 'url' or 'host' and 'port'`);
            options.url = `${options.host}:${options.port}/`;
        }

        if (!/^http:\/\//.test(options.url))
            options.url = `http://${options.url}`;

        this.client = new Client({
            repository: options.repository,
            url: options.url,
        });
    }

    getById<T extends object>(
        entityType: Type<T> | string,
        id: string,
    ): Promise<T> {
        return this.query(entityType, { id }).then((res) => {
            return res[0];
        });
    }

    query<T extends object>(
        entityType: Type<T> | string,
        options: {
            conditions?: Condition[];
            id?: string;
        } = {},
    ): Promise<T[]> {
        if (TsSparql.client == undefined)
            throw new Error('No client configured');

        const _entityType =
            typeof entityType === 'string'
                ? this.metadata.storage.constructors[entityType]
                : entityType;

        if (_entityType === null)
            throw new Error(`Could not find entity ${_entityType}`);

        const {
            name,
            idKey,
            properties,
            graph,
            type,
        } = this.metadata.entityType(_entityType).getMetadata();

        const entProperties: { [key: string]: string } = {};

        properties.forEach((p) => {
            if (p.entity !== undefined) {
                entProperties[p.key] = p.entity;
            }
        });

        const mapper = this.sparqlMapper
            .idKey(idKey)
            .properties(properties, name);

        if (graph != undefined) mapper.graph(`<${graph.toString()}>`);
        if (options.id != undefined) mapper.id(type + options.id);

        const sparql = mapper.sparql('SELECT');

        const connection = TsSparql.client?.getConnection();

        return connection!.get(sparql).then(async (_res) => {
            TsSparql.client?.releaseConnection(connection!);

            const res = [];

            for (let i = 0; i < _res.results.bindings.length; i++) {
                const b = _res.results.bindings[i];

                const entity = this.entityMapper.map(
                    _entityType,
                    b,
                    options.id,
                );

                let entities: { key: string; value: string }[] = [];
                Object.entries(b).forEach(([key, v]) => {
                    if (
                        v.type === 'uri' &&
                        key !== idKey &&
                        v.value !== type.toString() + entity[idKey]
                    )
                        entities.push({ key, value: v.value });
                });

                for (let i = 0; i < entities.length; i++) {
                    const e = entities[i];
                    const type = entProperties[e.key];

                    const id = e.value.substr(
                        this.metadata.storage.types[type].toString().length,
                    );

                    const en = await this.getById(type, id);

                    (<any>entity)[e.key] = en;
                }

                res.push(entity);
            }
            return res;
        });
    }

    save<T extends object>(entity: T): Promise<void> {
        if (TsSparql.client == undefined)
            throw new Error('No client configured');

        const {
            name,
            idKey,
            properties: _p,
            type,
            graph,
        } = this.metadata.entityInstance(entity).getMetadata();

        const entities: any[] = [];

        // get id
        const id = (entity as any)[idKey];
        let properties: Property[] = [];

        _p.forEach((p) => {
            p.value = (entity as any)[p.key];

            if (p.datatype === 'Array') {
                const { iri, entity, key, optional } = p;
                const values = p.value as any[];

                if (values == undefined) return false;
                properties.push(
                    ...values
                        .map<Property>((value) => {
                            return {
                                datatype: value.constructor.name,
                                iri,
                                entity,
                                key,
                                optional,
                                value,
                            };
                        })
                        .filter((p) => p.value !== undefined),
                );
            } else {
                properties.push(p);
            }
        });

        properties.filter((p) => {
            if (p.entity !== undefined && p.value !== undefined) {
                entities.push(p.value);
            }
            return p.value != undefined;
        });

        const mapper = this.sparqlMapper
            .subject(`<${type.toString()}${id}>`)
            .properties(properties, name);
        if (graph != undefined) mapper.graph(`<${graph.toString()}>`);

        const sparql = mapper.sparql('INSERT');

        entities.forEach((e) => this.save(e));

        const connection = TsSparql.client?.getConnection();

        return connection!
            .post(sparql)
            .then(() => TsSparql.client?.releaseConnection(connection!));
    }

    // search();
}
