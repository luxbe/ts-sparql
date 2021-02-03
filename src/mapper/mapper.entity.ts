import { DataMapper } from './mapper.data';
import { Binding, Property, Type } from '../interfaces';
import { Metadata } from '../metadata';

export class EntityMapper {
    private static _instance: EntityMapper;
    private dataMapper: DataMapper;

    private constructor() {
        this.dataMapper = DataMapper.global;
    }

    public static get global() {
        if (!EntityMapper._instance) {
            EntityMapper._instance = new EntityMapper();
        }
        return EntityMapper._instance;
    }

    map<T>(
        type: Type<T>,
        binding: Binding,
        id?: string,
    ): {
        entity: T;
        relatedEntityProperties: Property[];
    } {
        const entity = Object.create(type.prototype);

        const relatedEntityProperties: Property[] = [];

        const { idKey, properties, type: _t } = Metadata.global
            .entityType(type)
            .getMetadata();

        entity[idKey] =
            id || binding[idKey]!.value.substr(_t.toString().length);

        for (const p of properties) {
            const bindingProperty = binding[p.key];

            if (bindingProperty === undefined) continue;

            const value = this.dataMapper.mapFromString(
                binding[p.key].value,
                binding[p.key].datatype || 'String',
            );

            if (p.isArray) {
                entity[p.key] = [];
            }

            if (p.entity !== undefined) {
                p.value = value;
                relatedEntityProperties.push(p);
            } else {
                if (p.datatype === 'Array') {
                    entity[p.key].push(value);
                } else {
                    entity[p.key] = value;
                }
            }
        }

        return {
            entity,
            relatedEntityProperties,
        };
    }
}
