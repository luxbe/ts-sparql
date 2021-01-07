import { Storage } from '../storage';

export function Property(iri: string, name?: string) {
    return (target: object, key: string) => {
        name ||= target.constructor.name.toLowerCase();

        // filter out prefix and predicate from iri
        const matches = iri.match(/(.+?):(.*)/) || [];
        const prefix = matches[1];
        const predicate = matches[2];

        // create empty array if no array is specified
        Storage.global.properties[name] ||= [];
        Storage.global.properties[name].push({
            key,
            namespace: prefix,
            predicate,
        });
    };
}
