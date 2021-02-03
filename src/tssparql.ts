import { Client } from './client';
import { Property, Response, Type } from './interfaces';
import { Condition } from './interfaces/condition';
import { Iri } from './iri';
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
    ): Promise<T | undefined> {
        return this.query(entityType, { id }).then((res) => {
            return res[0];
        });
    }

    getAll<T extends object>(entityType: Type<T> | string): Promise<T[]> {
        return this.query(entityType);
    }

    query<T extends object>(
        entityType: Type<T> | string,
        options: {
            conditions?: {
                [key: string]: string;
            };
            id?: string;
        } = {},
    ): Promise<T[]> {
        if (TsSparql.client === undefined)
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

        if (graph !== undefined) mapper.graph(`<${graph.toString()}>`);
        if (options.id !== undefined) mapper.id(type + options.id);
        if (options.conditions !== undefined)
            mapper.conditions(options.conditions);

        const sparql = mapper.sparql('SELECT');

        console.log(sparql);

        const connection = TsSparql.client?.getConnection();

        return connection!.get(sparql).then(async (_res) => {
            TsSparql.client?.releaseConnection(connection!);

            const res = [];

            for (const binding of _res.results.bindings) {
                const {
                    entity,
                    relatedEntityProperties,
                } = this.entityMapper.map(_entityType, binding, options.id);

                for await (const relatedEntityData of relatedEntityProperties) {
                    relatedEntityData.datatype ||= relatedEntityData.entity;
                    if (
                        relatedEntityData.datatype !== undefined &&
                        this.metadata.storage.entities.includes(
                            relatedEntityData.datatype,
                        )
                    ) {
                        const id = relatedEntityData.value.substr(
                            this.metadata.storage.types[
                                relatedEntityData.datatype
                            ].toString().length,
                        );

                        const relatedEntity = await this.getById(
                            relatedEntityData.datatype,
                            id,
                        );

                        if (relatedEntityData.isArray)
                            (entity as any)[relatedEntityData.key].push(
                                relatedEntity,
                            );
                        else
                            (entity as any)[
                                relatedEntityData.key
                            ] = relatedEntity;
                    }
                }

                // const entities: { key: string; value: string }[] = [];
                // Object.entries(binding).forEach(([key, v]) => {
                //     // if (
                //     //     v.type === 'uri' &&
                //     //     key !== idKey &&
                //     //     v.value !== type.toString() + entity[idKey]
                //     // )
                //     //     entities.push({ key, value: v.value });
                // });

                res.push(entity);
            }
            return res;
        });
    }

    save<T extends object>(entity: T, limit: number = 1): Promise<void> {
        if (TsSparql.client === undefined)
            throw new Error('No client configured');

        const {
            name,
            idKey,
            properties: metadataProperties,
            type,
            graph,
        } = this.metadata.entityInstance(entity).getMetadata();

        // get id
        const id = (entity as any)[idKey];
        const properties: Property[] = [];

        // properties where other entites are referenced
        const entityProperties: any[] = [];

        for (const p of metadataProperties) {
            p.value = (entity as any)[p.key];

            if (p.value === undefined) continue;

            if (p.isArray) {
                const values = p.value as any[];
                if (values === undefined || values.length === 0) continue;

                p.datatype = values[0].constructor.name;
            }

            if (p.value !== undefined) {
                if (p.entity !== undefined && limit > 0) {
                    entityProperties.push(p.value);
                }
                properties.push(p);
            }
        }

        const mapper = this.sparqlMapper
            .subject(`<${type.toString()}${id}>`)
            .properties(properties, name);
        if (graph !== undefined) mapper.graph(`<${graph.toString()}>`);

        const sparql = mapper.sparql('INSERT');

        // console.log(sparql);

        entityProperties.forEach((e) => this.save(e, limit - 1));

        const connection = TsSparql.client?.getConnection();

        return connection!
            .post(sparql)
            .finally(() => TsSparql.client?.releaseConnection(connection!));
    }

    // search();
}
