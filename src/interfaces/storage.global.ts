import Iri from '../iri';
import { Property } from './property';
import { Type } from './type';

export interface Storage {
    entities: string[];
    types: {
        [key: string]: Iri;
    };
    graphs: {
        [key: string]: Iri;
    };
    idKeys: {
        [key: string]: string;
    };
    properties: {
        [key: string]: Property[];
    };
    namespaces: {
        [key: string]: {
            [key: string]: string;
        };
    };
    constructors: {
        [key: string]: Type<any>;
    };
}
