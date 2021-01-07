const repositories = {
    head: {
        vars: ['uri', 'id', 'title', 'readable', 'writable'],
    },
    results: {
        bindings: [
            {
                readable: {
                    datatype: 'http://www.w3.org/2001/XMLSchema#boolean',
                    type: 'literal',
                    value: 'true',
                },
                id: {
                    type: 'literal',
                    value: 'example',
                },
                title: {
                    type: 'literal',
                    value: '',
                },
                uri: {
                    type: 'uri',
                    value: 'http://localhost:7200/repositories/example',
                },
                writable: {
                    datatype: 'http://www.w3.org/2001/XMLSchema#boolean',
                    type: 'literal',
                    value: 'true',
                },
            },
        ],
    },
};

export default function request(
    url: string,
    options: any,
    body?: string,
): Promise<any> {
    return new Promise((resolve, reject) => {
        if (/repositories$/.test(url)) {
            return resolve(repositories);
        }
        if (
            /repositories\/example\/statements$/.test(url) &&
            options.method == 'POST'
        ) {
        }
        console.log(url, options, body);
    });
}
