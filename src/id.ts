import { IRDFObject } from './object';

export function RDFId(prefix: string = '') {
    return (target: object, key: string) => {
        const get = (): IRDFObject['__rdfid__'] => {
            return {
                prefix,
                key,
            };
        };

        Object.defineProperty(target, '__rdfid__', {
            get,
        });
    };
}
