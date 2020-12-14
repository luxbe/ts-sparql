import { IEntity } from './entity';

export function Id(prefix: string = '') {
    return (target: object, key: string) => {
        const get = (): IEntity['__rdfid__'] => {
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
