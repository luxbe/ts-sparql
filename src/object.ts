export interface IRDFObject {
    __rdfid__: {
        prefix: string;
        key: string;
    };
    __prefixes__: { [key: string]: string };
}

export const instanceOfRDFObject = (object: any): object is IRDFObject => {
    return (
        object !== undefined &&
        object.__rdfid__ !== undefined &&
        object.__rdfprefixes__ !== undefined
    );
};

export function RDFObject(prefixes?: IRDFObject['__prefixes__']) {
    return function <T extends { new (...args: any[]): {} }>(constructor: T) {
        const get = function (): IRDFObject['__prefixes__'] {
            return prefixes || {};
        };

        const set = function (_prefixes: IRDFObject['__prefixes__']) {
            prefixes = _prefixes;
        };

        Object.defineProperty(constructor.prototype, '__prefixes__', {
            get,
            set,
        });
    };
}
