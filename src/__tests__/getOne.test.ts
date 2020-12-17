import { TsSparql } from '..';
import { User } from './user';

let tsSparql = TsSparql.init({
    url: 'http://localhost:7200/',
    repository: 'example',
});

const user = new User('1234', 'test-name');

it('should save one user', async () => {
    const save = tsSparql.save(user);

    expect(save).resolves.toEqual(user);
});

it('should get one user', async () => {
    const _user = await tsSparql.getOne(User, '1234');

    console.log(_user);

    expect(_user).toEqual(user);
});
