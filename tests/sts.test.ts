jest.mock("@aws-sdk/client-sts");

// import { STSClient, AssumeRoleCommand } from "@aws-sdk/client-sts";
import { assumeRole } from "../src/sts";

describe("STS", () => {
  test("should handle missing credentails", () => {
    expect(() => assumeRole("role", {})).rejects.toThrow("AWS Credentials");
  });
});