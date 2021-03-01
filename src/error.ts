export function error(message: string): Error {
    return new Error(`${message}\nUsage: with-aws-creds <command> OR with-aws-creds '<command>'`);
}