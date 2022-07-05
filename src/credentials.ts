import { platform } from "os";
import { join } from "path";
import { existsSync } from "fs";

import { Configuration, DEFAULT_PROFILE, parseFile, Profiles } from "./properties";
import { debug } from "./debug";

function getCredentialsFileNameInFolder(folder: string): string {
    return join(folder, ".aws", "credentials");
}

function getCredentialsFileName(): string {
    debug("platform %o", platform());
    switch (platform()) {
        case "linux":
            if (process.env.HOME) {
                return getCredentialsFileNameInFolder(process.env.HOME);
            }
            return getCredentialsFileNameInFolder(join("/home", process.env.USER));
        case "win32":
            return getCredentialsFileNameInFolder(process.env.USERPROFILE || process.env.HOMEPATH);
        default:
            throw new Error(`Platform - ${platform()} - is not supported!`);
    }
}

function readCredentialsFile(file: string): Profiles {
    if (!existsSync(file)) {
        throw new Error(`File is not found: ${file}!`);
    }
    return parseFile(file);
}

export interface Credentials extends Configuration {
    aws_access_key_id?: string;
    aws_secret_access_key?: string;
    aws_session_token?: string;
    aws_role_session_name?: string;
    region?: string;
}

export function getCredentials(awsProfile?: string): Credentials {
    const file = getCredentialsFileName();
    debug("credentials file %o", file);

    const profiles = readCredentialsFile(file);
    const profileNames = Object.keys(profiles);
    debug("profiles %o", profileNames);

    const profile = awsProfile || process.env.AWS_PROFILE || DEFAULT_PROFILE;
    debug("profile %o", profile);
    if (!profiles[profile]) {
        if (profileNames.length === 1) {
            console.warn(`There is no such profile as ${profile}, using the only profile: ${profileNames[0]}.`);
            return profiles[profileNames[0]];
        }
        throw new Error(`There is no such profile as ${profile}!`);
    }
    return profiles[profile];
}