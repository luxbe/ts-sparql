import { Connection } from './connection';
import { Property } from './interfaces';
import { Mapper } from './mapper';
import { Metadata } from './metadata';

export class TsSparql {
    private metadata: Metadata;
    private mapper: Mapper;
    private connection?: Connection;

    static init() {
        return new TsSparql(Metadata.global, new Mapper());
    }

    private constructor(metadata: Metadata, mapper: Mapper) {
        this.metadata = metadata;
        this.mapper = mapper;
    }

    save<T extends object>(
        entity: T,
        options: {
            graph?: string;
        } = {},
    ): Promise<void> {
        // if (this.connection == undefined)
        //     throw new Error('No connection configured');

        const {
            idKey,
            properties: _props,
            type,
        } = this.metadata.entityInstance(entity).getMetadata();

        // get id
        const id = (entity as any)[idKey];
        type.setPredicate(type.predicate + id);

        const properties: Property[] = _props.map((p) => {
            p.value = (entity as any)[p.key];
            return p;
        });

        const mapper = this.mapper
            .subject(type.toString())
            .properties(properties);
        if (options.graph != undefined) mapper.graph(options.graph);

        const sparql = mapper.sparql('INSERT');

        return new Promise((resolve, reject) => {});
    }
}
