import { Storage } from '../storage/storage';

export function Id() {
    return (target: object, key: string) => {
        const name = target.constructor.name.toLowerCase();
        Storage.global.ids[name] = key;
    };
}
