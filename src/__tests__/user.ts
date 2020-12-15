import { Id, Entity } from '../';

@Entity('user')
export class User {
    @Id()
    id: string;

    // @Property()
    // name: string;

    constructor(id: string, name: string) {
        this.id = id;
        // this.name = name;
    }
}

// TsSparql.init({ url: 'xyz' });
