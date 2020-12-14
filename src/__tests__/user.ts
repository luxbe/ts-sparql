import { RDFId } from '../id';
import { RDFObject } from '../object';

@RDFObject()
export class User {
    @RDFId('user')
    id: string;

    name: string;

    constructor(id: string, name: string) {
        this.id = id;
        this.name = name;
    }
}
