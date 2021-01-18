import { Storage, Namespace, Property } from '../storage';

interface Options {
    name: string;
    namespaces?: Namespace;
}

export interface TempStorage {
    name: string;
    idKey: string;
    properties: Property[];
}

export interface IEntity {
    __tssparql__: TempStorage;
}

export function isIEntity(object: any): object is IEntity {
    const _o = object as IEntity;
    return (
        _o.__tssparql__ !== undefined &&
        _o.__tssparql__.idKey !== undefined &&
        _o.__tssparql__.name !== undefined &&
        _o.__tssparql__.properties !== undefined
    );
}

export function Entity(options: Options) {
    return <T extends new (...args: any[]) => {}>(constructor: T) => {
        const name = options.name;
        const namespaces = options.namespaces || {};

        const iriReg = /^[a-zA-Z0-9]*$/;
        if (!iriReg.test(name))
            throw new Error(`'${name}' does not match RegExp '${iriReg}'`);

        const entity = constructor.prototype as IEntity;

        if (!isIEntity(entity))
            throw new Error(`${constructor.name} does not have an Id`);

        entity.__tssparql__.name = name;

        Storage.global.names.push(name);

        Storage.global.entities[name] = {
            name: name,
            idKey: entity.__tssparql__.idKey,
            properties: entity.__tssparql__.properties,
            namespaces: namespaces,
        };

        return class extends constructor {};
    };
}
