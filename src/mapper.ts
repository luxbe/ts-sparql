import 'reflect-metadata';
import { instanceOfRDFObject, IRDFObject } from './object';

export class RDFMapper {
    static inserts: string[] = [];
    static prefixes: Map<string, string> = new Map();

    static sparql() {
        return (
            Array.from(RDFMapper.prefixes)
                .map(([key, value]) => `PREFIX ${key}: <${value}>`)
                .join('\n') +
            '\n' +
            RDFMapper.inserts.join(';\n')
        );
    }

    static serialize(o: object | object[]): typeof RDFMapper {
        if (Array.isArray(o)) {
            this.inserts = o.map((_o) => this._serialize(_o));
        } else {
            this.inserts = [this._serialize(o)];
        }

        return RDFMapper;
    }

    private static _serialize(o: object): string {
        if (typeof o === undefined) return '';

        const _o = o as IRDFObject;
        const idKey = _o.__rdfid__.key;
        const idPrefix = _o.__rdfid__.prefix;

        const id = idPrefix + ':' + (o as any)[idKey];

        let prefixes = _o.__prefixes__;

        const parse = (key: string, object: any): string => {
            if (Array.isArray(object)) {
                return object.map((v) => parse(key, v)).join('; \n');
            }
            if (instanceOfRDFObject(object)) {
                prefixes = {
                    ...prefixes,
                    ...object.__prefixes__,
                };
                return `voc:${key} ${object.__rdfid__.prefix}:${
                    (object as any)[object.__rdfid__.key]
                }`;
            }
            return `voc:${key} "${object}"`;
        };

        const attributes = Object.entries(o)
            .filter(([key, value]) => key !== idKey && value !== undefined)
            .map(([key, value]) => {
                return parse(key, value);
            });

        if (prefixes)
            Object.entries(prefixes).forEach(([key, value]) =>
                RDFMapper.prefixes.set(key, value),
            );

        return `INSERT DATA {
GRAPH ${o.constructor.name.toLowerCase()}: {
${id}
a ${o.constructor.name.toLowerCase()}:${o.constructor.name} ;
${attributes.join(' ;\n')} .
}}`;
    }
}
