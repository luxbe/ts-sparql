import { IdMetadata } from '../interfaces';

export function Id() {
    return (target: object, key: string) => {
        Reflect.defineMetadata(
            IdMetadata.METADATA_KEY,
            key,
            target.constructor,
        );
    };
}
