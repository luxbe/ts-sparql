import { IdMetadata, PrefixMetadata, PropertyMetadata } from '../interfaces';
import Iri from '../iri';
import { Metadata } from '../metadata';
import PrefixManager from '../prefixManager';

export function Entity(options: { iri: Iri | string; graph?: Iri | string }) {
    return <T extends new (...args: any[]) => {}>(constructor: T) => {
        if (typeof options.iri === 'string')
            options.iri = Iri.init(options.iri);
        if (options.graph !== undefined && typeof options.graph === 'string')
            options.graph = Iri.init(options.graph);

        const key = constructor.name;

        const idKey = Reflect.getMetadata('tssparql:idKey', constructor) as
            | typeof IdMetadata.VALUE
            | undefined;

        if (idKey !== undefined) Metadata.global.storage.idKeys[key] = idKey;

        const _prefixMetadata = Reflect.getMetadata(
            'tssparql:prefixes',
            constructor,
        ) as typeof PrefixMetadata.VALUE | undefined;

        if (_prefixMetadata !== undefined) {
            const { prefixes, options: prefixOptions } = _prefixMetadata;
            Object.entries(prefixes).forEach(([prefix, namespace]) => {
                PrefixManager.add(
                    prefix,
                    namespace,
                    prefixOptions.override,
                    prefixOptions.global ? undefined : key,
                );
            });
        }

        const properties = Reflect.getMetadata(
            'tssparql:properties',
            constructor,
        ) as typeof PropertyMetadata.VALUE | undefined;

        if (properties !== undefined) {
            Metadata.global.storage.properties[key] ||= [];
            Metadata.global.storage.properties[key].push(...properties);
        }

        Metadata.global.storage.entities.push(key);
        Metadata.global.storage.types[key] = options.iri;
        Metadata.global.storage.constructors[key] = constructor;
        if (options.graph !== undefined)
            Metadata.global.storage.graphs[key] = options.graph;

        return constructor;
    };
}
