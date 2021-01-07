import { Storage, Namespace } from '../storage';

interface Options {
    iri?: string;
    namespaces?: Namespace;
}

export function Entity(options: Options = {}) {
    return <T extends new (...args: any[]) => {}>(constructor: T) => {
        const iri = options.iri || constructor.name.toLowerCase();
        const namespaces = options.namespaces || {};

        const iriReg = /^[a-zA-Z0-9]*$/;

        if (!iriReg.test(iri))
            throw new Error(`'${iri}' does not match RegExp '${iriReg}'`);

        if (Storage.global.names.includes(iri))
            throw new Error(`'${iri}' is already defined`);

        if (!!!Storage.global.keys[iri])
            throw new Error(`'${iri}' has no Id property`);

        const localNamespaces = Object.keys(namespaces);
        const globalNamespaces = Object.keys(
            Storage.global.namespaces['##global##'],
        );
        // check if prefix is defined either locally or globally
        Storage.global.properties[iri].forEach((prop) => {
            if (
                !!prop.namespace &&
                !localNamespaces.includes(prop.namespace) &&
                !globalNamespaces.includes(prop.namespace)
            )
                throw new Error(
                    `Prefix: '${prop.namespace}' is not defined in '${iri}'`,
                );
        });

        Storage.global.names.push(iri);
        Storage.global.namespaces[iri] = namespaces;
    };
}
