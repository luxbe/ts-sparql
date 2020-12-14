export interface IEntity {
    __rdfid__: {
        prefix: string;
        key: string;
    };
    __prefixes__: { [key: string]: string };
}

export const instanceOfEntity = (object: any): object is IEntity => {
    return (
        object !== undefined &&
        object.__rdfid__ !== undefined &&
        object.__rdfprefixes__ !== undefined
    );
};

export function Entity(prefixes?: IEntity['__prefixes__']) {
    return <T extends new (...args: any[]) => {}>(constructor: T) => {
        const get = (): IEntity['__prefixes__'] => {
            return prefixes || {};
        };

        const set = (_prefixes: IEntity['__prefixes__']) => {
            prefixes = _prefixes;
        };

        Object.defineProperty(constructor.prototype, '__prefixes__', {
            get,
            set,
        });
    };
}
