import { isPrefix, isValidRegex } from '../helper';
import { IPrefixes } from '../storage/storage';

type Operations = 'INSERT' | 'SELECT';

export interface Relation {
    predicate: string;
    object: string;
    literal: boolean;
}

export class SparqlMapper {
    private _subject?: string;
    private _attributes: Relation[] = [];

    subject(subject: string) {
        if (!isValidRegex(subject))
            throw new Error(`Subject '${subject}' does not match RegExp`);
        this._subject = subject;
        this._attributes = [];
        return this;
    }

    assign(attributes: Relation | Relation[]) {
        if (!this._subject) throw new Error('No subject provided');
        if (Array.isArray(attributes)) {
            attributes.forEach((a) => {
                if (!isValidRegex(a.object) || !isValidRegex(a.predicate))
                    throw new Error(
                        `Relation '${a.object}' => '${a.predicate}' does not match RegExp`,
                    );
            });
        } else {
            if (
                !isValidRegex(attributes.object) ||
                !isValidRegex(attributes.predicate)
            )
                throw new Error(
                    `Relation '${attributes.object}' => ${attributes.predicate}' does not match RegExp`,
                );
        }
        this._attributes = this._attributes.concat(attributes);
        return this;
    }

    sparql(
        operation: Operations = 'INSERT',
        graph?: string,
        prefixes: IPrefixes = {},
        globalPrefixes: IPrefixes = {},
    ) {
        if (!this._subject) throw new Error('No subject provided');
        if (!this._attributes.length) throw new Error('No attributes provided');

        if (graph) {
            if (!isValidRegex(graph, ':/#'))
                throw new Error(`'${graph}' does not match RegExp`);
            const _graph = graph.replace(/:$/, '');
            if (isPrefix(graph) && !Object.keys(prefixes).includes(_graph)) {
                if (!Object.keys(globalPrefixes).includes(_graph))
                    throw new Error(`'${graph}' is not defined`);
                prefixes[_graph] = globalPrefixes[_graph];
            }
        }

        const prefixStr = prefixes
            ? Object.entries(prefixes)
                  .map(([key, value]) => {
                      return `PREFIX ${key}: <${value}>`;
                  })
                  .join(' ') + ' '
            : '';

        return `${prefixStr}${
            operation === 'INSERT'
                ? 'INSERT DATA'
                : operation === 'SELECT'
                ? 'SELECT * WHERE'
                : ''
        } { ${graph ? `GRAPH ${graph} {` : ''} ${
            this._subject
        } ${this._attributes
            .map(
                (a) =>
                    `${a.predicate} ${a.literal ? `"${a.object}"` : a.object}`,
            )
            .join(';')} . } ${graph ? `}` : ''}`;
    }
}
