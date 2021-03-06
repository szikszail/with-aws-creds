jest.mock("child_process");
jest.mock("fs");
jest.mock("os");

import { execSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { platform } from "os";

import { run } from "../src";

describe("run", () => {
    let prevArgv: string[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let prevEnv: any;

    beforeEach(() => {
        prevArgv = process.argv;
        prevEnv = process.env;
        jest.clearAllMocks();
    });

    afterEach(() => {
        process.argv = prevArgv;
        process.env = prevEnv;
    });

    test("should fail if no command is specified", () => {
        process.argv = ["node", "bin/with-aws-creds"];
        expect(() => run()).toThrow("There is no command specified!");
    });

    test("should fail if command is not correct", () => {
        process.argv = ["node", "bin/other"];
        expect(() => run()).toThrow("Command is not correct!");
    });

    test("should fail if only arguments set", () => {
        process.argv = ["node", "bin/with-aws-creds", "--p1=v1"];
        expect(() => run()).toThrow("There is no command specified!");

        process.argv = ["node", "bin/with-aws-creds", "--p1", "v1"];
        expect(() => run()).toThrow("There is no command specified!");
    });

    test("should fail if an argument is set without value", () => {
        process.argv = ["node", "bin/with-aws-creds", "--p1", "--p2", "v2", "which", "node"];
        expect(() => run()).toThrow("Argument is not valid, missing value: p1!");

        process.argv = ["node", "bin/with-aws-creds", "--p3", "--", "which", "node"];
        expect(() => run()).toThrow("Argument is not valid, missing value: p3!");
    });

    test("should execute command with credentails", () => {
        (platform as unknown as jest.Mock).mockReturnValue("win32");
        (existsSync as unknown as jest.Mock).mockReturnValue(true);
        (readFileSync as unknown as jest.Mock).mockReturnValue(`
        [default]
        key1 = value1
        key2=value2

        [profile]
        key3 =value3  
        key4= value4
        `);

        process.env = { HOMEPATH: "/homepath" };
        process.argv = ["node", "bin/with-aws-creds", "which", "node", "--smth"];
        run();

        expect(execSync).toHaveBeenCalledWith("which node --smth", {
            env: {
                HOMEPATH: "/homepath",
                "KEY1": "value1",
                "KEY2": "value2"
            },
            cwd: process.cwd(),
            stdio: 'inherit',
            encoding: "utf-8"
        });
    });

    test("should execute command with separator but without additional arguments", () => {
        (platform as unknown as jest.Mock).mockReturnValue("win32");
        (existsSync as unknown as jest.Mock).mockReturnValue(true);
        (readFileSync as unknown as jest.Mock).mockReturnValue(`
        [default]
        key1 = value1
        key2=value2

        [profile]
        key3 =value3  
        key4= value4
        `);

        process.env = { HOMEPATH: "/homepath" };
        process.argv = ["node", "bin/with-aws-creds", "--", "which", "node", "--smth"];
        run();

        expect(execSync).toHaveBeenCalledWith("which node --smth", {
            env: {
                HOMEPATH: "/homepath",
                "KEY1": "value1",
                "KEY2": "value2"
            },
            cwd: process.cwd(),
            stdio: 'inherit',
            encoding: "utf-8"
        });
    });

    test("should execute command with credentails and additional parameters", () => {
        (platform as unknown as jest.Mock).mockReturnValue("win32");
        (existsSync as unknown as jest.Mock).mockReturnValue(true);
        (readFileSync as unknown as jest.Mock).mockReturnValue(`
        [default]
        key1 = value1
        key2=value2

        [profile]
        key3 =value3  
        key4= value4
        `);

        process.env = { HOMEPATH: "/homepath" };
        process.argv = ["node", "bin/with-aws-creds", "--aws_account_id", "123", "which", "node", "--smth"];
        run();

        expect(execSync).toHaveBeenCalledWith("which node --smth", {
            env: {
                HOMEPATH: "/homepath",
                "KEY1": "value1",
                "KEY2": "value2",
                "AWS_ACCOUNT_ID": "123",
            },
            cwd: process.cwd(),
            stdio: 'inherit',
            encoding: "utf-8"
        });
    });

    test("should execute command with profile set in additional parameters", () => {
        (platform as unknown as jest.Mock).mockReturnValue("win32");
        (existsSync as unknown as jest.Mock).mockReturnValue(true);
        (readFileSync as unknown as jest.Mock).mockReturnValue(`
        [default]
        key1 = value1
        key2=value2

        [profile]
        key3 =value3  
        key4= value4
        `);

        process.env = { HOMEPATH: "/homepath" };
        process.argv = ["node", "bin/with-aws-creds", "--aws_profile", "profile", "which", "node", "--smth"];
        run();

        expect(execSync).toHaveBeenCalledWith("which node --smth", {
            env: {
                HOMEPATH: "/homepath",
                "KEY3": "value3",
                "KEY4": "value4",
                "AWS_PROFILE": "profile",
            },
            cwd: process.cwd(),
            stdio: 'inherit',
            encoding: "utf-8"
        });
    });

    test("should execute command with separator argument", () => {
        (platform as unknown as jest.Mock).mockReturnValue("win32");
        (existsSync as unknown as jest.Mock).mockReturnValue(true);
        (readFileSync as unknown as jest.Mock).mockReturnValue(`
        [default]
        key1 = value1
        key2=value2

        [profile]
        key3 =value3  
        key4= value4
        `);

        process.env = { HOMEPATH: "/homepath" };
        process.argv = ["node", "bin/with-aws-creds", "--aws_profile", "profile", "--", "which", "node", "--smth"];
        run();

        expect(execSync).toHaveBeenCalledWith("which node --smth", {
            env: {
                HOMEPATH: "/homepath",
                "KEY3": "value3",
                "KEY4": "value4",
                "AWS_PROFILE": "profile",
            },
            cwd: process.cwd(),
            stdio: 'inherit',
            encoding: "utf-8"
        });
    });
});