import { Type } from '../interfaces';
import { Iri } from '../iri';
import { Metadata } from '../metadata';
import { XSD } from '../namespaces';

export class DataMapper {
    private static _instance: DataMapper;
    private _metadata = Metadata.global;

    private _objectMappers: {
        [key: string]: (value: string) => any;
    } = {};
    private _stringMappers: {
        [key: string]: (value: any) => string;
    } = {
        String: (value) => `"${value}"`,
        Date: (value) => `"${(value as Date).toISOString()}"^^<${XSD.DATE}>`,
        Boolean: (value) => `"${value as boolean}"^^<${XSD.BOOLEAN}>`,
        Iri: (value) => (value as Iri).toString(),
    };

    public static get global() {
        if (!DataMapper._instance) {
            DataMapper._instance = new DataMapper();
        }
        return DataMapper._instance;
    }

    public static registerObjectMap<T>(
        datatype: string | Type<T>,
        map: (value: any) => string,
        override: boolean = false,
    ) {
        if (typeof datatype !== 'string') datatype = datatype.name;

        if (
            Object.keys(DataMapper.global._objectMappers).includes(datatype) &&
            !override
        )
            throw new Error(`Mapper for ${datatype} is already defined`);

        DataMapper.global._objectMappers[datatype] = map;
    }

    public static registerStringMap<T>(
        datatype: string | Type<T>,
        map: (value: string) => any,
        override: boolean = false,
    ) {
        if (typeof datatype !== 'string') datatype = datatype.name;

        if (
            Object.keys(DataMapper.global._stringMappers).includes(datatype) &&
            !override
        )
            throw new Error(`Mapper for ${datatype} is already defined`);

        DataMapper.global._stringMappers[datatype] = map;
    }

    mapToString<T>(value: any, datatype: Type<T> | string): string {
        if (typeof datatype !== 'string') datatype = datatype.name;

        if (!Object.keys(this._stringMappers).includes(datatype)) {
            if (!this._metadata.storage.entities.includes(datatype))
                return value.toString();

            const { type, idKey } = this._metadata
                .entityType(datatype)
                .getMetadata();

            return `<${type.toString()}${value[idKey]}>`;
        }

        return this._stringMappers[datatype](value);
    }

    mapFromString(value: string, datatype: string): any {
        if (!Object.keys(this._objectMappers).includes(datatype)) return value;
        return this._objectMappers[datatype](value);
    }
}
