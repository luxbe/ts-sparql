import { Id, Entity, Property } from '../';

@Entity('user', {
    user: 'http://drei-punkte-fuer-alle/user#',
})
export class User {
    @Id()
    id: string;

    @Property()
    name: string;

    constructor(id: string, name: string) {
        this.id = id;
        this.name = name;
    }
}
