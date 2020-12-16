import { TsSparql } from '..';
let tsSparql = TsSparql.init({
    url: 'http://localhost:7200/',
    repository: 'example',
});

it('should store the url', () => {
    expect(tsSparql.url).toEqual(
        'http://localhost:7200/repositories/example/statements',
    );
});
