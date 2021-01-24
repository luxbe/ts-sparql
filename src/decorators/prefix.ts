import { Prefixes, PrefixMetadata } from '../interfaces';

export function Prefix(
    prefixes: Prefixes,
    options: typeof PrefixMetadata['VALUE']['options'] = {
        override: false,
        global: false,
    },
) {
    return <T extends new (...args: any[]) => {}>(constructor: T) => {
        Reflect.defineMetadata(
            PrefixMetadata.METADATA_KEY,
            { prefixes, options },
            constructor,
        );
        return constructor;
    };
}
