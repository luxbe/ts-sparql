import 'reflect-metadata';
import { Property as IProperty, PropertyMetadata } from '../interfaces';
import { Iri } from '../iri';

interface Options {
    optional?: boolean;
    entity?: string;
}

export function Property(iri: Iri | string, options: Options = {}) {
    return (target: object, key: string) => {
        if (typeof iri === 'string') iri = new Iri(iri);

        const properties: IProperty[] =
            Reflect.getMetadata(
                PropertyMetadata.METADATA_KEY,
                target.constructor,
            ) || [];

        const datatype = (Reflect.getMetadata(
            'design:type',
            target,
            key,
        ).name ||= 'String');

        properties.push({
            key,
            iri,
            optional: options.optional || false,
            entity: options.entity,
            datatype,
        });

        Reflect.defineMetadata(
            PropertyMetadata.METADATA_KEY,
            properties,
            target.constructor,
        );
    };
}
