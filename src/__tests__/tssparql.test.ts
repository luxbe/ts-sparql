import { TsSparql } from '..';
import { User } from './user';

it('should store the url', () => {
    let tsSparql = TsSparql.init({
        url: 'http://localhost:7200/',
        repository: 'example',
    });

    expect(tsSparql.url).toEqual(
        'http://localhost:7200/repositories/example/statements',
    );
});

it('should build the url with host and port', () => {
    let tsSparql = TsSparql.init({
        host: 'http://localhost',
        port: 7200,
        repository: 'example',
    });

    expect(tsSparql.url).toEqual(
        'http://localhost:7200/repositories/example/statements',
    );
});

it('should throw error when no url, host and port provided', () => {
    expect(() => {
        TsSparql.init({
            repository: 'example',
        });
    }).toThrowError(`Expected either 'host' and 'port' or 'url'`);
});
