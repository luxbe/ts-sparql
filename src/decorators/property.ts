import TsSparql from '..';
import { Storage } from '../storage';
import { IEntity, isIEntity, TempStorage } from './entity';

export function Property(iri: string, name?: string) {
    return (target: object, key: string) => {
        if ((target as IEntity).__tssparql__ == undefined) {
            const data: TempStorage = {
                idKey: '',
                name: '',
                properties: [],
            };
            (target as any).__tssparql__ = data;
        }

        // filter out prefix and predicate from iri
        const matches = iri.match(/(.+?):(.*)/) || [];
        const namespace = matches[1];
        const predicate = matches[2];

        (target as IEntity).__tssparql__.properties?.push({
            key,
            namespace,
            predicate,
        });
    };
}
