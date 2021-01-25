import { Property } from '../interfaces';
import PrefixManager from '../prefixManager';
import { DataMapper } from './mapper.data';

export class SPARQLMapper {
    private dataMapper = DataMapper.global;

    private s?: string;
    private g?: string;
    private p?: Property[];
    private n: { [key: string]: string } = {};

    subject(subject: string) {
        this.s = subject;
        return this;
    }

    properties(properties: Property[], name?: string) {
        this.p = properties
            .filter((p) => p.value != undefined)
            .map((p) => {
                const { prefix } = p.iri;
                if (prefix.length > 0 && !Object.keys(this.n).includes(prefix))
                    this.n[prefix] = PrefixManager.get(prefix, name);

                return {
                    ...p,
                    value: this.dataMapper.mapToString(p.value, p.datatype),
                };
            });
        return this;
    }

    graph(graph: string) {
        this.g = graph;
    }

    sparql(operation: 'INSERT' | 'SELECT'): string {
        if (this.s == undefined) throw new Error(`Subject is not defined`);

        if (this.p == undefined || this.p.length == 0)
            throw new Error(`Properties are not defined`);

        switch (operation) {
            case 'INSERT':
                return this.insert();
            case 'SELECT':
                throw new Error('Operation not implemented');
        }
    }

    private insert(): string {
        const prefStr = Object.entries(this.n)
            .map(([prefix, namespace]) => `PREFIX ${prefix}: <${namespace}>`)
            .join(' ');
        const mainStr = `${this.s} ${this.p!.map(
            (p) => `${p.iri} ${p.value}`,
        ).join('; ')} .`;
        const graphStr =
            this.g != undefined ? ` GRAPH ${this.g} { ${mainStr} }` : mainStr;
        return `${prefStr} INSERT DATA { ${graphStr} }`;
    }
}
