import request from '../__mocks__/request';

jest.mock('../client/request', () => request);
import TsSparql from '..';

import { User } from './user';

const tsSparql = TsSparql.init();

test('tsSparql should connect to database', async (done) => {
    TsSparql.connect({
        repository: 'example',
        host: 'localhost',
        port: 7200,
    });
});

test('tsSparql should save User', async (done) => {
    const user = new User('1111', 'hello');

    tsSparql
        .save(user)
        .then(done())
        .catch((err) => done(err));
});
