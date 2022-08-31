jest.mock("fs");
jest.mock("os");

import { existsSync, readFileSync } from "fs";
import { sep, join } from "path";
import { platform } from "os";
import { getCredentials } from "../src/credentials";

describe("getCredentials", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let prevEnv: any;

    beforeEach(() => {
        prevEnv = process.env;
        (readFileSync as unknown as jest.Mock).mockReturnValue(`
        [default]
        key1 = value1
        key2=value2

        [profile]
        key3 =value3  
        key4= value4
        `);
    });

    afterEach(() => {
        process.env = prevEnv;
    });

    test("should handle unsupported platform", () => {
        (platform as unknown as jest.Mock).mockReturnValue("not-supported");
        expect(() => getCredentials()).toThrow("Platform - not-supported - is not supported!");
    });

    test("should load windows credentials (using USERPROFILE)", () => {
        (platform as unknown as jest.Mock).mockReturnValue("win32");
        (existsSync as unknown as jest.Mock).mockReturnValue(true);

        process.env = { USERPROFILE: sep + "userprofile", HOMEPATH: sep + "homepath" };
        const configuration = getCredentials();
        expect(configuration).toEqual({
            "key1": "value1",
            "key2": "value2"
        });
        expect(existsSync).toHaveBeenCalledWith(sep + join("userprofile", ".aws", "credentials"));
    });

    test("should load windows credentials (using HOMEPATH)", () => {
        (platform as unknown as jest.Mock).mockReturnValue("win32");
        (existsSync as unknown as jest.Mock).mockReturnValue(true);

        process.env = { HOMEPATH: sep + "homepath" };
        const configuration = getCredentials();
        expect(configuration).toEqual({
            "key1": "value1",
            "key2": "value2"
        });
        expect(existsSync).toHaveBeenCalledWith(sep + join("homepath", ".aws", "credentials"));
    });

    test("should load linux credentials (using HOME)", () => {
        (platform as unknown as jest.Mock).mockReturnValue("linux");
        (existsSync as unknown as jest.Mock).mockReturnValue(true);

        process.env = { USER: "user", HOME: sep + "this-is-home" };
        const configuration = getCredentials();
        expect(configuration).toEqual({
            "key1": "value1",
            "key2": "value2"
        });
        expect(existsSync).toHaveBeenCalledWith(sep + join("this-is-home", ".aws", "credentials"));
    });

    test("should load linux credentails (using USER)", () => {
        (platform as unknown as jest.Mock).mockReturnValue("linux");
        (existsSync as unknown as jest.Mock).mockReturnValue(true);

        process.env = { USER: "user" };
        const configuration = getCredentials();
        expect(configuration).toEqual({
            "key1": "value1",
            "key2": "value2"
        });
        expect(existsSync).toHaveBeenCalledWith(sep + join("home", "user", ".aws", "credentials"));
    });

    test("should handle missing credentails file", () => {
        (platform as unknown as jest.Mock).mockReturnValue("linux");
        (existsSync as unknown as jest.Mock).mockReturnValue(false);

        process.env = { USER: "user", HOME: sep + "this-is-home" };
        expect(() => getCredentials()).toThrow(`File is not found: ${sep + join("this-is-home", ".aws", "credentials")}`);
    });

    test("should handle explicit profile", () => {
        (platform as unknown as jest.Mock).mockReturnValue("win32");
        (existsSync as unknown as jest.Mock).mockReturnValue(true);

        process.env = { HOMEPATH: "/homepath", AWS_PROFILE: "profile" };
        const configuration = getCredentials();
        expect(configuration).toEqual({
            "key3": "value3",
            "key4": "value4"
        });
    });

    test("should handle missing profile but return default", () => {
        (platform as unknown as jest.Mock).mockReturnValue("win32");
        (existsSync as unknown as jest.Mock).mockReturnValue(true);

        (readFileSync as unknown as jest.Mock).mockReturnValue(`
        [default]
        key1 = value1
        key2=value2
        `);

        process.env = { HOMEPATH: sep + "homepath", AWS_PROFILE: "no-such-profile" };
        const configuration = getCredentials();
        expect(configuration).toEqual({
            "key1": "value1",
            "key2": "value2"
        });
    });

    test("should handle missing profile but throw error is there is multiple one", () => {
        (platform as unknown as jest.Mock).mockReturnValue("win32");
        (existsSync as unknown as jest.Mock).mockReturnValue(true);

        process.env = { HOMEPATH: sep + "homepath", AWS_PROFILE: "no-such-profile" };
        expect(() => getCredentials()).toThrow("There is no such profile as no-such-profile!");
    });
});