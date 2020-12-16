const _validCharacters = 'a-zA-Z0-9-_';

export function isValidRegex(value: string, extra?: string) {
    const reg = new RegExp(`[${_validCharacters}${extra || ''}]+$`);
    return reg.test(value);
}

export function isPrefix(value: string, extra?: string) {
    const reg = new RegExp(`[${_validCharacters}${extra || ''}]+:$`);
    return reg.test(value);
}
