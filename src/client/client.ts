import { Connection } from './connection';

export class Client {
    MAX_CONNECTIONS = 1000;

    private repository: string;
    private url: string;
    private connections: Connection[] = [];

    constructor(options: { repository: string; url: string }) {
        this.repository = options.repository;
        this.url = options.url;
    }

    getConnection(): Connection {
        if (this.connections.length < this.MAX_CONNECTIONS) {
            const connection = new Connection({
                repository: this.repository,
                url: this.url,
            });
            this.connections.push(connection);
            return connection;
        }
        throw new Error('No free connections available');
    }

    releaseConnection(connection: Connection) {
        const index = this.connections.indexOf(connection);
        if (index >= 0) {
            this.connections.splice(index, 1);
        }
    }
}
