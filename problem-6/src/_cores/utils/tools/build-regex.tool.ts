export const buildRegex = (raw: string): RegExp => {
    const trimmed = raw.trim();
    const match = trimmed.match(/^\/(.+)\/([a-z]*)$/i);
    if (match) {
        return new RegExp(match[1].replace(/\\\\/g, '\\'), match[2]);
    }
    return new RegExp(trimmed.replace(/\\\\/g, '\\'));
};