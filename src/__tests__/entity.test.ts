import { User } from './user';
import { Storage } from '../storage/storage';
import { Entity } from '..';

test('should include user in storage', () => {
    new User('1234', 'Hello there');

    expect(Storage.global.names.includes('user')).toBeTruthy();
});

it('should not accept 2 entities with the same name', () => {
    expect(() => {
        @Entity('user')
        class abc {}
    }).toThrowError('user is already defined');
});
