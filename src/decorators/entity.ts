import { PrefixMetadata } from '../interfaces';
import IdMetadata from '../interfaces/id.metadata';
import { PropertyMetadata } from '../interfaces/property.metadata';
import Iri from '../iri';
import { Metadata } from '../metadata';
import PrefixManager from '../prefixManager';

export function Entity(iri: Iri | string) {
    return <T extends new (...args: any[]) => {}>(constructor: T) => {
        if (typeof iri === 'string') iri = Iri.init(iri);
        const key = constructor.name;

        const idKey = Reflect.getMetadata('tssparql:idKey', constructor) as
            | typeof IdMetadata.VALUE
            | undefined;

        if (idKey != undefined) Metadata.global.storage.idKeys[key] = idKey;

        const _prefixMetadata = Reflect.getMetadata(
            'tssparql:prefixes',
            constructor,
        ) as typeof PrefixMetadata.VALUE | undefined;

        if (_prefixMetadata != undefined) {
            const { prefixes, options } = _prefixMetadata;
            Object.entries(prefixes).forEach(([prefix, namespace]) => {
                PrefixManager.add(
                    prefix,
                    namespace,
                    options.override,
                    options.global ? undefined : key,
                );
            });
        }

        const properties = Reflect.getMetadata(
            'tssparql:properties',
            constructor,
        ) as typeof PropertyMetadata.VALUE | undefined;

        if (properties != undefined) {
            Metadata.global.storage.properties[key] ||= [];
            Metadata.global.storage.properties[key].push(...properties);
        }

        Metadata.global.storage.entities.push(key);
        Metadata.global.storage.types[key] = iri;

        return constructor;
    };
}
