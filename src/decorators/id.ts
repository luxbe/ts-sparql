import { Storage } from '../storage';

export function Id(name?: string) {
    return (target: object, key: string) => {
        name ||= target.constructor.name.toLowerCase();
        Storage.global.keys[name] = key;
    };
}
