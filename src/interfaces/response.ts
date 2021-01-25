export interface Binding {
    [key: string]: {
        datatype?: string;
        type: 'literal' | 'uri';
        value: string;
    };
}

export interface Response {
    head: {
        vars: string[];
    };
    results: {
        bindings: Binding[];
    };
}
