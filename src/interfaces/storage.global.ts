import Iri from '../iri';
import { Property } from './property';

export interface Storage {
    entities: string[];
    types: {
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
}
