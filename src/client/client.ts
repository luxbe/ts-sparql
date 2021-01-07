import http from 'http';

interface SQueryResult {
    head: {
        vars: string[];
    };
    results: {
        bindings: {
            [key: string]: {
                type: 'literal';
                value: string;
            };
        }[];
    };
}

export class Client {
    baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    private request(
        url: string,
        options: http.RequestOptions,
        body?: string,
    ): Promise<any> {
        return new Promise((resolve, reject) => {
            const req = http.request(url, options, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    if (data.length > 0) data = JSON.parse(data);
                    if (res.statusCode === 200 || res.statusCode === 204) {
                        resolve(data);
                    } else {
                        reject(data);
                    }
                });
            });

            req.on('error', (error) => {
                reject(error);
            });

            if (body) req.write(body);
            req.end();
        });
    }

    get(
        query: string,
        limit: number = 10,
        offset: number = 0,
    ): Promise<SQueryResult> {
        const data = `query=${query}&limit=${limit}&offset=${offset}`;

        const options = {
            method: 'POST',
            headers: {
                'Content-Type':
                    'application/x-www-form-urlencoded; charset=UTF-8',
                Accept: 'application/sparql-results+json',
            },
        };

        return this.request(`${this.baseUrl}`, options, data);
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

        return this.request(`${this.baseUrl}/statements`, options, data);
    }
}