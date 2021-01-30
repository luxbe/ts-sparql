import { DataMapper } from './mapper.data';
import { Binding, Type } from '../interfaces';
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

    map<T>(type: Type<T>, binding: Binding, id?: string): T {
        const entity = Object.create(type.prototype);

        const { idKey, properties, type: _t } = Metadata.global
            .entityType(type)
            .getMetadata();

        entity[idKey] =
            id || binding[idKey]!.value.substr(_t.toString().length);

        properties.forEach((p) => {
            const b = binding[p.key];

            if (b === undefined) return;

            entity[p.key] = this.dataMapper.mapFromString(
                binding[p.key].value,
                binding[p.key].datatype || 'String',
            );
        });

        return entity;
    }
}
