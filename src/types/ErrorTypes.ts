export class NoTokenError extends Error {
    constructor(msg: string) {
        super(msg);
        Object.setPrototypeOf(this, NoTokenError.prototype);
    }
}