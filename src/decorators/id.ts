import IdMetadata from '../interfaces/id.metadata';

export function Id() {
    return (target: object, key: string) => {
        Reflect.defineMetadata(
            IdMetadata.METADATA_KEY,
            key,
            target.constructor,
        );
    };
}
