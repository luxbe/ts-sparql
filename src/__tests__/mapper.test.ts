import { Mapper } from '../mapper';

const mapper = new Mapper();

test('should configure insert statement correctly', () => {
    const sparql = mapper
        .subject('user:1234')
        .assign([
            {
                predicate: 'a',
                object: 'user:User',
                type: 'LITERAL',
            },
            {
                predicate: 'vac:name',
                object: 'MyUser',
                type: 'STRING',
            },
        ])
        .sparql('INSERT');

    expect(sparql).toEqual(
        'INSERT DATA { user:1234 a user:User; vac:name "MyUser" . }',
    );
});

test('should configure namespaces correclty', () => {
    const sparql = mapper
        .subject('user:1234')
        .namespaces({
            user: 'http://example.com/user',
            voc: 'http://example.com/voc',
        })
        .assign([
            {
                predicate: 'a',
                object: 'user:User',
                type: 'LITERAL',
            },
            {
                predicate: 'voc:name',
                object: 'MyUser',
                type: 'STRING',
            },
        ])
        .sparql('INSERT');

    expect(sparql).toEqual(
        'PREFIX user: <http://example.com/user> PREFIX voc: <http://example.com/voc> INSERT DATA { user:1234 a user:User; voc:name "MyUser" . }',
    );
});

test('should configure graph correctly', () => {
    const sparql = mapper
        .subject('user:1234')
        .namespaces({
            user: 'http://example.com/user',
            voc: 'http://example.com/voc',
        })
        .assign([
            {
                predicate: 'a',
                object: 'user:User',
                type: 'LITERAL',
            },
            {
                predicate: 'voc:name',
                object: 'MyUser',
                type: 'STRING',
            },
        ])
        .graph('example')
        .sparql('INSERT');

    expect(sparql).toEqual(
        'PREFIX user: <http://example.com/user> PREFIX voc: <http://example.com/voc> INSERT DATA { GRAPH example { user:1234 a user:User; voc:name "MyUser" . } }',
    );
});
