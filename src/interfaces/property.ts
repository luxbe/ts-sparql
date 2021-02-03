import { Iri } from '../iri';

export interface Property {
    key: string;
    value?: any;
    datatype?: string;
    iri: Iri;
    optional: boolean;
    entity?: string;
    isArray: boolean;
}
