import { isValidRegex } from '../helper';
import { Storage } from '../storage/storage';

export function Property(prefix?: string, literal: boolean = true) {
    if (prefix && !isValidRegex(prefix))
        throw new Error(`'${prefix}' does not match RegExp in class`);
    return (target: object, key: string) => {
        const name = target.constructor.name.toLowerCase();
        Storage.global.properties[name] ||= [];
        Storage.global.properties[name].push({ key, prefix, literal });
    };
}
