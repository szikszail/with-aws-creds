/*
 * A simplified properties loader only for
 * AWS credentials file
 */

import { readFileSync } from "fs";
import { debug } from "./debug";

export interface Configuration {
    [key: string]: string;
}

export interface Profiles {
    [profile: string]: Configuration;
}

function removeComment(line: string): string {
    return line.replace(/^([^#!]*)[#!]?.*$/, "$1");
}

export const DEFAULT_PROFILE = "default";

function parseKeyValuePair(line: string): [string, string] {
    const tokens = line.split("=");
    return [tokens[0].trim(), tokens.slice(1).join("=").trim()];
}

function parse(text: string): Profiles {
    debug("parse text.length %d", text.length);
    const valueLines = text.split(/\r?\n\r?/)
        .map(l => removeComment(l).trim())
        .filter(Boolean);
    debug("parse lines %d", valueLines.length);

    const profiles: Profiles = {};
    let profile = DEFAULT_PROFILE;
    for (const line of valueLines) {
        if (line[0] === "[") {
            debug("parse profile %o", line);
            profile = line.slice(1, -1);
        } else {
            const [key, value] = parseKeyValuePair(line);
            debug("parse key %o", key);
            if (!profiles[profile]) {
                profiles[profile] = {};
            }
            profiles[profile][key] = value;
        }
    }
    return profiles;
}

export function parseFile(file: string): Profiles {
    debug("parseFile %o", file);
    return parse(readFileSync(file, "utf-8"));
}