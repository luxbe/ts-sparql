// import { Namespace } from '../interfaces';
// import { Attribute } from '../interfaces/attribute';
// import Parser from './parser';

// type Operation = 'INSERT' | 'SELECT';

// export class Mapper {
//     private _subject?: string;
//     private _graph?: string;
//     private _attributes: Attribute[] = [];
//     private _namespaces?: Namespace = {
//         xsd: 'http://www.w3.org/2001/XMLSchema#',
//     };

//     subject(subject: string) {
//         this._subject = subject;
//         this._attributes = [];
//         return this;
//     }

//     assign(attributes: Attribute[]) {
//         if (!this._subject) throw new Error('No subject provided');

//         attributes = attributes.reduce<Attribute[]>((attributes, a) => {
//             if (!!a.object) attributes.push(Parser.parse(a));
//             return attributes;
//         }, []);

//         this._attributes = this._attributes.concat(attributes);
//         return this;
//     }

//     namespaces(namespaces: Namespace) {
//         this._namespaces = { ...this._namespaces, ...namespaces };
//         return this;
//     }

//     graph(graph?: string) {
//         this._graph = graph;
//         return this;
//     }

//     sparql(operation: Operation) {
//         if (!this._subject) throw new Error('No subject provided');
//         if (!this._attributes.length) throw new Error('No attributes provided');

//         const namespaceStr = !!this._namespaces
//             ? Object.entries(this._namespaces)
//                   .map(([key, value]) => {
//                       return `PREFIX ${key}: <${value}>`;
//                   })
//                   .join(' ') + ' '
//             : '';

//         let optionalAttributes: Attribute[] = [];

//         this._attributes.filter((a) => {});

//         return `${namespaceStr}${
//             operation === 'INSERT'
//                 ? 'INSERT DATA'
//                 : operation === 'SELECT'
//                 ? 'SELECT * WHERE'
//                 : ''
//         } { ${this._graph ? `GRAPH ${this._graph} { ` : ''}${
//             this._subject
//         } ${this._attributes
//             .map((a) => {
//                 return `${a.predicate} ${
//                     a.type === 'LITERAL' ? `${a.object}` : `"${a.object}"`
//                 }`;
//             })
//             .join('; ')} . }${this._graph ? ` }` : ''}`;
//     }
// }
