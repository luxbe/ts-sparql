import { User } from './user';
import { RDFMapper } from '../mapper';

test('RDFMapper', () => {
    const user = new User('1234', 'Hello there');
    console.log(RDFMapper.serialize(user).sparql());
    expect(1).toEqual(1);
});
