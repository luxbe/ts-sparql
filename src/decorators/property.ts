import { Storage } from '../storage/storage';

export function Property() {
    return (target: object, key: string) => {
        const name = target.constructor.name.toLowerCase();
        Storage.global.properties[name] ||= [];
        Storage.global.properties[name].push(key);
    };
}
