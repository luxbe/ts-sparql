import { IRDFObject } from './object';

export function RDFId(prefix: string = '') {
    return function (target: Object, key: string) {
        const get = function (): IRDFObject['__rdfid__'] {
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
