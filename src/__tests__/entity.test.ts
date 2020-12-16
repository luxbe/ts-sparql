import { Entity } from '..';
import { User } from './user';

it('should not accept 2 entities with the same name', () => {
    new User('1234', 'Hello there');

    expect(() => {
        @Entity('user')
        class abc {}
    }).toThrowError("'user' is already defined");

    expect(() => {
        @Entity()
        class User {}
    }).toThrowError("'user' is already defined");
});
