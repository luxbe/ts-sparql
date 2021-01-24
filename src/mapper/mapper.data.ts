import { Type } from '../interfaces';
import { XSD } from '../namespaces';

export type DataMap = (value: any) => string;

export class DataMapper {
    private static _instance: DataMapper;
    private _mappers: {
        [key: string]: DataMap;
    } = {
        String: (value) => {
            return `"${value}"`;
        },
        Date: (value) => {
            return `"${(value as Date).toISOString()}"^^<${XSD.DATE}>`;
        },
        Boolean: (value) => {
            return `"${value as Boolean}"^^<${XSD.BOOLEAN}>`;
        },
    };

    private constructor() {}

    public static get global() {
        if (!DataMapper._instance) {
            DataMapper._instance = new DataMapper();
        }
        return DataMapper._instance;
    }

    public static register<T>(
        datatype: string | Type<T>,
        func: (value: any) => string,
        override: boolean = false,
    ) {
        if (typeof datatype != 'string') datatype = datatype.name;

        if (
            Object.keys(DataMapper.global._mappers).includes(datatype) &&
            !override
        )
            throw new Error(`Mapper for ${datatype} is already defined`);

        DataMapper.global._mappers[datatype] = func;
    }

    map<T>(value: any, datatype: string | Type<T>): string {
        if (typeof datatype != 'string') datatype = datatype.name;

        if (!Object.keys(this._mappers).includes(datatype))
            return value.toString();
        return this._mappers[datatype](value);
    }
}
