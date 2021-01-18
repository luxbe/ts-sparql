import { Namespace } from '../storage';
import { Attribute } from './attribute';

type Operation = 'INSERT' | 'SELECT';

export class Mapper {
    private _subject?: string;
    private _graph?: string;
    private _attributes: Attribute[] = [];
    private _namespaces?: Namespace;

    subject(subject: string) {
        this._subject = subject;
        this._attributes = [];
        return this;
    }

    assign(attributes: Attribute | Attribute[]) {
        if (!this._subject) throw new Error('No subject provided');
        this._attributes = this._attributes.concat(attributes);
        return this;
    }

    namespaces(namespaces: Namespace) {
        this._namespaces = { ...this._namespaces, ...namespaces };
        return this;
    }

    graph(graph?: string) {
        this._graph = graph;
        return this;
    }

    sparql(operation: Operation) {
        if (!this._subject) throw new Error('No subject provided');
        if (!this._attributes.length) throw new Error('No attributes provided');

        const namespaceStr = !!this._namespaces
            ? Object.entries(this._namespaces)
                  .map(([key, value]) => {
                      return `PREFIX ${key}: <${value}>`;
                  })
                  .join(' ') + ' '
            : '';

        return `${namespaceStr}${
            operation === 'INSERT'
                ? 'INSERT DATA'
                : operation === 'SELECT'
                ? 'SELECT * WHERE'
                : ''
        } { ${this._graph ? `GRAPH ${this._graph} { ` : ''}${
            this._subject
        } ${this._attributes
            .map((a) => {
                return `${a.predicate} ${
                    a.type === 'LITERAL' ? `${a.object}` : `"${a.object}"`
                }`;
            })
            .join('; ')} . }${this._graph ? ` }` : ''}`;
    }
}
