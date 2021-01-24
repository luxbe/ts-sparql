import Iri from '../iri';

export interface Property {
    key: string;
    value?: any;
    datatype: any;
    iri: Iri;
    optional: boolean;
}
