import { isIEntity, TempStorage } from './entity';

export function Id(name?: string) {
    return (target: object, key: string) => {
        if (!isIEntity(target)) {
            const data: TempStorage = {
                idKey: key,
                name: '',
                properties: [],
            };
            (target as any).__tssparql__ = data;
        } else {
            target.__tssparql__.idKey = key;
        }
    };
}
