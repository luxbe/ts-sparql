import { Storage, IPrefixes } from '../storage/storage';

export function Entity(name?: string, prefixes?: IPrefixes) {
    return <T extends new (...args: any[]) => {}>(constructor: T) => {
        name ||= constructor.name.toLowerCase();
        prefixes ||= {};

        if (Storage.global.names.includes(name))
            throw new Error(`${name} is already defined`);

        Storage.global.names.push(name);
        Storage.global.prefixes[name] = prefixes;
    };
}
