jest.mock("child_process");
jest.mock("fs");
jest.mock("os");
jest.mock("../src/sts");

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
        expect(() => run()).rejects.toThrow("There is no command specified!");
    });

    test("should fail if command is not correct", () => {
        process.argv = ["node", "bin/other"];
        expect(() => run()).rejects.toThrow("Command is not correct!");
    });

    test("should fail if only arguments set", () => {
        process.argv = ["node", "bin/with-aws-creds", "--p1=v1"];
        expect(() => run()).rejects.toThrow("There is no command specified!");

        process.argv = ["node", "bin/with-aws-creds", "--p1", "v1"];
        expect(() => run()).rejects.toThrow("There is no command specified!");
    });

    test("should fail if an argument is set without value", () => {
        process.argv = ["node", "bin/with-aws-creds", "--p1", "--p2", "v2", "which", "node"];
        expect(() => run()).rejects.toThrow("Argument is not valid, missing value: p1!");

        process.argv = ["node", "bin/with-aws-creds", "--p3", "--", "which", "node"];
        expect(() => run()).rejects.toThrow("Argument is not valid, missing value: p3!");
    });

    test("should execute command with credentails", async () => {
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
        await run();

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

    test("should execute command with sts", async () => {
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
        process.argv = ["node", "bin/with-aws-creds", "--aws_role", "aws-role", "which", "node", "--smth"];
        await run();

        expect(execSync).toHaveBeenCalledWith("which node --smth", {
            env: {
                AWS_ROLE: "aws-role",
                HOMEPATH: "/homepath",
                "KEY1": "value1",
                "KEY2": "value2",
                "ROLE": "aws-role",
            },
            cwd: process.cwd(),
            stdio: 'inherit',
            encoding: "utf-8"
        });
    });

    test("should execute command with sts with dash-arguments", async () => {
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
        process.argv = ["node", "bin/with-aws-creds", "--aws-role", "aws-role", "which", "node", "--smth"];
        await run();

        expect(execSync).toHaveBeenCalledWith("which node --smth", {
            env: {
                AWS_ROLE: "aws-role",
                HOMEPATH: "/homepath",
                "KEY1": "value1",
                "KEY2": "value2",
                "ROLE": "aws-role",
            },
            cwd: process.cwd(),
            stdio: 'inherit',
            encoding: "utf-8"
        });
    });

    test("should execute command with separator but without additional arguments", async () => {
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
        await run();

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

    test("should execute command with credentails and additional parameters", async () => {
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
        await run();

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

    test("should execute command with credentails and additional parameters with dash-arguments", async () => {
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
        process.argv = ["node", "bin/with-aws-creds", "--aws-account-id", "123", "which", "node", "--under_score"];
        await run();

        expect(execSync).toHaveBeenCalledWith("which node --under_score", {
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

    test("should execute command with profile set in additional parameters", async () => {
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
        await run();

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

    test("should execute command with separator argument", async () => {
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
        await run();

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

    test("should execute command with separator argument and dash-arguments", async () => {
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
        process.argv = ["node", "bin/with-aws-creds", "--aws-profile", "profile", "--", "which", "node", "--under_score"];
        await run();

        expect(execSync).toHaveBeenCalledWith("which node --under_score", {
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