import { Entity, Property } from '..';
import { Id, Prefix } from '../decorators';

@Entity({
    iri: 'http://example.com/user#',
})
@Prefix({
    ex: 'http://example.com',
})
export class User {
    @Id()
    id: string;

    @Property('ex:myName')
    name: string;

    constructor(id: string, name: string) {
        this.id = id;
        this.name = name;
    }
}
