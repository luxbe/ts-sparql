import { TsSparql } from '..';
import { User } from './user';

it('should store the url', () => {
    let tsSparql = TsSparql.init({
        url: 'http://localhost:7200/',
        repository: 'example',
    });

    expect(tsSparql.url).toEqual('http://localhost:7200/repositories/example');
});

it('should build the url with host and port', () => {
    let tsSparql = TsSparql.init({
        host: 'http://localhost',
        port: 7200,
        repository: 'example',
    });

    expect(tsSparql.url).toEqual('http://localhost:7200/repositories/example');
});

it('should throw error when no url, host and port provided', () => {
    expect(() => {
        TsSparql.init({
            repository: 'example',
        });
    }).toThrowError(`Expected either 'host' and 'port' or 'url'`);
});

it('should connect to repository', async () => {
    let tsSparql = TsSparql.init({
        host: 'http://localhost',
        port: 7200,
        repository: 'example',
    });

    // TODO: test if repository exists, if it is readable and writeable

    await expect(tsSparql.test()).resolves.toBeDefined();
});

it('should not connect to repository', async () => {
    let tsSparql = TsSparql.init({
        host: 'http://localhost',
        port: 7200,
        repository: 'i_dont_exist',
    });

    // TODO: test if repository exists, if it is readable and writeable

    await expect(tsSparql.test()).rejects.toEqual(
        'Unknown repository: i_dont_exist',
    );
});

it('should query repository', async () => {
    let tsSparql = TsSparql.init({
        host: 'http://localhost',
        port: 7200,
        repository: 'example',
    });

    // TODO: test if repository exists, if it is readable and writeable

    const res = await tsSparql.test();

    expect(JSON.parse(res)).toEqual({
        head: {
            vars: ['id', 'name', 'teams'],
        },
        results: {
            bindings: [],
        },
    });
});
