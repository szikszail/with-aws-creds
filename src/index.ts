import { getCredentials } from "./credentials";
import * as sts from "./sts";
import { execSync } from "child_process";
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

interface ProcessedArguments {
    command: string;
    additionalParameters: {
        [key: string]: string;
        aws_profile?: string;
        aws_role?: string;
    }
}

const CLA = /^--([^=]+)(?:=(.+))?$/;
const SEPARATOR = "--";

function separateCommandAndArguments(args: string[]): [string, string[]] {
    const separatorIndex = args.indexOf(SEPARATOR);
    if (separatorIndex === -1) {
        return ["", args];
    }
    return [
        args.slice(separatorIndex + 1).join(" "),
        args.slice(0, separatorIndex),
    ];
}

function getProcessedArguments(args: string[]): ProcessedArguments {
    const commandParts: string[] = [];
    const processed: ProcessedArguments = {
        command: '',
        additionalParameters: {}
    };
    [processed.command, args] = separateCommandAndArguments(args);
    debug("initial %o %o", processed.command, args);
    if (!CLA.test(args[0])) {
        debug("no arguments");
        commandParts.push(...args);
    } else {
        let i = 0;
        for (; i < args.length; ++i) {
            const m = args[i].match(CLA);
            debug("arg: %o, i: %d, match: %o, next: %o", args[i], i, m, args[i + 1]);
            if (m) {
                if (m[2]) {
                    processed.additionalParameters[m[1]] = m[2];
                } else if (!args[i + 1] || CLA.test(args[i + 1])) {
                    throw error(`Argument is not valid, missing value: ${m[1]}!`);
                } else {
                    processed.additionalParameters[m[1]] = args[i + 1];
                    ++i;
                }
            } else {
                commandParts.push(...args.slice(i));
                break;
            }
        }
    }
    if (!processed.command) {
        if (!commandParts.length) {
            throw error("There is no command specified!");
        }
        processed.command = commandParts.join(" ");
    }
    debug("processedArguments %o", processed);
    return processed;
}

export async function run(): Promise<void> {
    const args = getArguments();
    debug("args %o", args);

    const { command, additionalParameters } = getProcessedArguments(args);
    debug("command %o", command);

    let awsCredentails = getCredentials(additionalParameters.aws_profile);
    debug("awsCredentials keys %o", Object.keys(awsCredentails));

    if (additionalParameters.aws_role) {
        awsCredentails = await sts.assumeRole(additionalParameters.aws_role, awsCredentails);
    }

    const credentials = {
        ...awsCredentails,
        ...additionalParameters,
    };
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
