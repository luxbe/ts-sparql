import Iri from '../iri';
import { Property } from './property';

export interface EntityStorage {
    name: string;
    type: Iri;
    idKey: string;
    properties: Property[];
    namespaces: { [key: string]: string };
}
