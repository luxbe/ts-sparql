import { Metadata } from './metadata';
import XSD from './namespaces/xsd.namespace';

export default class PrefixManager {
    private static _prefixes: {
        [key: string]: string;
    } = {
        [XSD.PREFIX]: XSD.NAMESPACE,
    };

    static add(
        prefix: string,
        namespace: string,
        override = false,
        name?: string,
    ) {
        const prefixes = name
            ? (Metadata.global.storage.namespaces[name] ||= {})
            : this._prefixes;

        if (Object.keys(prefixes).includes(prefix) && !override)
            throw new Error(`Prefix ${prefix} is already defined`);
        prefixes[prefix] = namespace;
    }

    static get(prefix: string, key?: string) {
        let res;
        if (key != undefined) {
            res = (Metadata.global.storage.namespaces[key] ||= {})[prefix];
        }
        if (res == undefined) res = this._prefixes[prefix];

        if (res == undefined)
            throw new Error(`Prefix ${prefix} is not defined`);

        return res;
    }
}
