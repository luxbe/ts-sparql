import { Property } from '../interfaces';
import { PrefixManager } from '../prefixManager';
import { DataMapper } from './mapper.data';

export class SPARQLMapper {
    private dataMapper = DataMapper.global;

    private s?: string;
    private g?: string;
    private c?: { [key: string]: string } = {};
    private _idKey?: string;
    private _id?: string;
    private p?: Property[];
    private n: { [key: string]: string } = {};

    subject(subject: string) {
        this.s = subject;
        return this;
    }

    idKey(idKey: string) {
        this._idKey = idKey;
        return this;
    }

    id(id: string) {
        this._id = `<${id}>`;
        return this;
    }

    properties(properties: Property[], name?: string) {
        this.p = properties.map((p) => {
            const { prefix } = p.iri;
            if (prefix !== undefined && !Object.keys(this.n).includes(prefix))
                this.n[prefix] = PrefixManager.get(prefix, name);
            if (p.value !== undefined && p.datatype !== undefined) {
                p.value = this.dataMapper.mapToString(p.value, p.datatype);
            }
            return p;
        });
        return this;
    }

    graph(graph: string) {
        this.g = graph;
    }

    conditions(conditions: { [key: string]: string }) {
        this.c = conditions;
    }

    sparql(operation: 'INSERT' | 'SELECT'): string {
        if (this.s === undefined && operation !== 'SELECT')
            throw new Error(`Subject is not defined`);

        if (this.p === undefined || this.p.length === 0)
            throw new Error(`Properties are not defined`);

        switch (operation) {
            case 'SELECT':
                return this.select();
            case 'INSERT':
                return this.insert();
        }
    }

    select(): string {
        const prefStr = Object.entries(this.n)
            .map(([prefix, namespace]) => `PREFIX ${prefix}: <${namespace}>`)
            .join(' ');

        const op: string[] = [];
        const nop: string[] = [];

        const idStr = this._id ? this._id : `?${this._idKey}`;

        const conditions = this.c || {};

        this.p!.forEach((p) => {
            let props = nop;
            if (p.optional) props = op;
            props.push(
                p.iri.toSparql() +
                    ' ' +
                    (conditions[p.key] !== undefined
                        ? `"${conditions[p.key]}"`
                        : '?' + p.key),
            );
        });

        const optionalStr = op.length
            ? `OPTIONAL { ${idStr} ${op.join('; ')}. } `
            : '';

        const whereStr = `${idStr} ${nop.join('; ')}. ${optionalStr}`;

        const selectStr = `SELECT * WHERE { ${whereStr} }`;

        return `${prefStr.length ? prefStr + ' ' : ''}${selectStr}`;
    }

    insert(): string {
        let prefStr = Object.entries(this.n)
            .map(([prefix, namespace]) => `PREFIX ${prefix}: <${namespace}>`)
            .join(' ');
        prefStr = prefStr.length ? prefStr + ' ' : '';

        const insertStr = `${this.s} ${this.p!.map(
            (p) => p.iri.toSparql() + ' ' + p.value,
        ).join('; ')} .`;
        const graphStr =
            this.g !== undefined
                ? `GRAPH ${this.g} { ${insertStr} }`
                : insertStr;
        return `${prefStr}INSERT DATA { ${graphStr} }`;
    }
}
