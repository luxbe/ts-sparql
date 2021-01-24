// import { Attribute } from '.';
// import { XSD } from '../namespaces';

// interface IParserFunctions {
//     [key: string]: (
//         value: any,
//     ) => {
//         value: string;
//         datatype: string;
//         namespace?: string;
//     };
// }

// export default class Parser {
//     static ParserFunctions: IParserFunctions = {
//         Date: (value: any) => {
//             return {
//                 value: value.toISOString(),
//                 datatype: XSD.DATE,
//                 namespace: XSD.namespace,
//             };
//         },
//     };

//     static getParserFunction() {
//         return this.ParserFunctions;
//     }

//     static parse(attribute: Attribute): Attribute {
//         const value = attribute.object;
//         const name: string = value.constructor.name;
//         const fn = this.ParserFunctions[name];

//         if (!!!fn) {
//             attribute.object = value as string;
//         } else {
//             attribute.type = 'LITERAL';
//             const res = fn(value);
//             attribute.namespace = res.namespace;
//             attribute.object = `"${res.value}"^^${
//                 res.namespace ? res.namespace + ':' : ''
//             }${res.datatype}`;
//         }
//         return attribute;
//     }
// }
