import 'reflect-metadata';
import { Property as IProperty, PropertyMetadata, Type } from '../interfaces';
import { Iri } from '../iri';

interface Options {
    optional?: boolean;
    entity?: string | Type<any>;
}

export function Property(iri: Iri | string, options: Options = {}) {
    return (target: object, key: string) => {
        if (typeof iri === 'string') iri = new Iri(iri);
        if (options.entity !== undefined && typeof options.entity !== 'string')
            options.entity = options.entity.name;

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
            datatype: datatype === 'Array' ? undefined : datatype,
            isArray: datatype === 'Array',
        });

        Reflect.defineMetadata(
            PropertyMetadata.METADATA_KEY,
            properties,
            target.constructor,
        );
    };
}
