import { Id } from '../id';
import { Entity } from '../entity';

@Entity()
export class User {
    @Id('user')
    id: string;

    name: string;

    constructor(id: string, name: string) {
        this.id = id;
        this.name = name;
    }
}
