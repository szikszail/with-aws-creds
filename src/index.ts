import { getCredentials } from "./credentials";
import { execSync } from "child_process";
import { normalize } from "path";
import { debug } from "./debug";
import { error } from "./error";

function getArguments(): string[] {
    const position = process.argv.findIndex(arg => /bin[/\\]with-aws-creds/i.test(arg));
    if (position === -1) {
        debug("args %o", process.argv);
        throw error("Command is not correct!");
    }
    return process.argv.slice(position + 1);
}

export function run(): void {
    const args = getArguments();
    debug("args %o", args);
    if (!args.length) {
        throw error("There is no command specified!");
    }

    const command = normalize(args.join(" "));
    debug("command %o", command);

    const credentials = getCredentials();
    debug("keys %o", Object.keys(credentials));

    const awsEnv: { [key: string]: string } = {};
    for (const key in credentials) {
        awsEnv[key.toUpperCase()] = credentials[key];
    }
    execSync(command, {
        env: {
            ...process.env,
            ...awsEnv,
        },
        cwd: process.cwd(),
        stdio: 'inherit',
        encoding: "utf-8",
    });
}
