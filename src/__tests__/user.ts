import { Id, Entity, Property } from '..';

@Entity('user', {
    user: 'http://example.com/user#',
    voc: 'http://example.com/voc#',
})
export class User {
    @Id()
    id: string;

    @Property('voc')
    name: string;

    constructor(id: string, name: string) {
        this.id = id;
        this.name = name;
    }
}
