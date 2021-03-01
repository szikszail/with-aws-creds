jest.mock("fs");

import { readFileSync } from "fs";
import { parseFile } from "../src/properties";

describe("parseFile", () => {
    test("should parse file with profiles", () => {
        (readFileSync as unknown as jest.Mock).mockReturnValue(`
        [default]
        key1 = value1
        key2=value2

        [profile]
        key1 =value1  
        key2= value2
        `);

        const profiles = parseFile("my-file");
        expect(readFileSync).toHaveBeenCalledWith("my-file", "utf-8");
        expect(profiles).toEqual({
            "default": {
                "key1": "value1",
                "key2": "value2"
            },
            "profile": {
                "key1": "value1",
                "key2": "value2"
            },
        });
    });

    test("should parse file without profiles", () => {
        (readFileSync as unknown as jest.Mock).mockReturnValue(`
        key1 = value1
        key2=value2
        key3 =value3  
        key4= value4
        `);

        const profiles = parseFile("my-file");
        expect(readFileSync).toHaveBeenCalledWith("my-file", "utf-8");
        expect(profiles).toEqual({
            "default": {
                "key1": "value1",
                "key2": "value2",
                "key3": "value3",
                "key4": "value4"
            }
        });
    });
});
