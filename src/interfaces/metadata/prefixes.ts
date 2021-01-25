export interface Prefixes {
    [key: string]: string;
}

export interface Options {
    override: boolean;
    global: boolean;
}

export default class PrefixMetadata {
    static METADATA_KEY = 'tssparql:prefixes';
    static VALUE: {
        prefixes: Prefixes;
        options: Options;
    };
}
