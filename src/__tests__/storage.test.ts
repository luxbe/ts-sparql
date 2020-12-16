import { Storage } from '../storage/storage';
import { User } from './user';

it('should include user in storage', () => {
    new User('1234', 'Hello there');

    expect(Storage.global.names.includes('user')).toBeTruthy();
});

it('should include user prefix in storage', () => {
    expect(Storage.global.prefixes['user']).toBeTruthy();

    expect(Storage.global.prefixes['user']['user']).toEqual(
        'http://drei-punkte-fuer-alle/user#',
    );
});

it('should include id in storage', () => {
    expect(Storage.global.ids['user']).toEqual('id');
});

it('should include name in storage', () => {
    expect(Storage.global.properties['user']).toContain('name');
    expect(Storage.global.properties['user']).toHaveLength(1);
});
