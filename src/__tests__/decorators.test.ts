import { Storage } from '../storage';
import { User } from './user';

const user = new User('1111', 'hallo');

test('storage should include key', () => {
    expect(Storage.global.names.includes('user')).toBe(true);
});

test("storage 'ex' prefix should equal http://example.com", () => {
    expect(Storage.global.namespaces['user']['ex']).toBe('http://example.com');
});

test('storage should include name property', () => {
    expect(Storage.global.properties['user'][0]).toStrictEqual({
        key: 'name',
        namespace: 'ex',
        predicate: 'myName',
    });
});