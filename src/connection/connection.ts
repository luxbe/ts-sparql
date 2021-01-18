import request from './request';

interface Options {
    url: string;
    repository: string;
}

export interface Response {
    head: {
        vars: string[];
    };
    results: {
        bindings: {
            [key: string]: {
                datatype?: string;
                type: string;
                value: string;
            };
        }[];
    };
}

export class Connection {
    url: string;
    repository: string;

    constructor(options: Options) {
        this.url = options.url;
        this.repository = options.repository;
    }

    static async init(options: Options): Promise<Connection> {
        return request(`${options.url}/repositories`, {
            headers: {
                accept: 'application/json',
            },
        }).then((res) => {
            const index = (res as Response).results.bindings.findIndex(
                (b) => b.id.value === options.repository,
            );
            if (index === -1)
                throw new Error(`repository '${options.repository}' not found`);
            return new Connection(options);
        });
    }

    get(
        query: string,
        limit: number = 10,
        offset: number = 0,
    ): Promise<Response> {
        const data = `query=${query}&limit=${limit}&offset=${offset}`;

        const options = {
            method: 'POST',
            headers: {
                'Content-Type':
                    'application/x-www-form-urlencoded; charset=UTF-8',
                Accept: 'application/sparql-results+json',
            },
        };

        return request(
            `${this.url}/repositories/${this.repository}`,
            options,
            data,
        );
    }

    post(sparql: string) {
        const data = sparql;

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/sparql-update',
                'Content-Length': data.length,
                Accept: 'text/plain',
            },
        };

        return request(
            `${this.url}/repositories/${this.repository}/statements`,
            options,
            data,
        );
    }
}
