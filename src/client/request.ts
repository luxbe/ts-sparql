import http from 'http';

export default function request(
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
                if (data.length > 0) {
                    if (
                        res.headers['content-type'] &&
                        res.headers['content-type'].includes('text/plain')
                    )
                        return;
                    data = JSON.parse(data);
                }
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
