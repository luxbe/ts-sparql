import { Entity, Property } from '..';
import { Id } from '../decorators';

@Entity({
    name: 'user',
    namespaces: {
        ex: 'http://example.com',
    },
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
