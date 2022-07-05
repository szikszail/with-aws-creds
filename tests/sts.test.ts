jest.mock("@aws-sdk/client-sts");

import { STSClient, AssumeRoleCommand } from "@aws-sdk/client-sts";
import { Credentials } from "../src/credentials";
import { assumeRole } from "../src/sts";

describe("STS", () => {
  test("should handle missing credentails", () => {
    expect(() => assumeRole("role", {})).rejects.toThrow("AWS Credentials");
  });

  test("should handle missing roleArn", () => {
    // @ts-ignore
    expect(() => assumeRole()).rejects.toThrow("Role ARN");
  });

  test("should assume role", async () => {
    (STSClient.prototype.send as unknown as jest.Mock).mockResolvedValue({
      Credentials: {
        AccessKeyId: 'AKI',
        SecretAccessKey: 'SAK',
        SessionToken: 'ST'
      }
    });

    const creds = await assumeRole('ROLE', {
      aws_access_key_id: 'aaki',
      aws_secret_access_key: 'asak',
      aws_session_token: 'ast',
      region: 'r',
    });
    const expectedCredentials: Credentials = {
      aws_access_key_id: 'AKI',
      aws_secret_access_key: 'SAK',
      aws_session_token: 'ST',
      aws_role_session_name: expect.stringContaining('with-aws-creds-')
    };
    expect(creds).toEqual(expectedCredentials);

    expect(STSClient.prototype.constructor).toHaveBeenCalledWith({
      credentials: {
        accessKeyId: 'aaki',
        secretAccessKey: 'asak',
        sessionToken: 'ast',
      },
      region: 'r',
    });
    expect(AssumeRoleCommand.prototype.constructor).toHaveBeenCalledWith({
      RoleArn: 'ROLE',
      RoleSessionName: expect.stringContaining('with-aws-creds-'),
    });
  });

  test("should handle issue during role assuming", () => {
    (STSClient.prototype.send as unknown as jest.Mock).mockRejectedValue("ERROR");

    expect(() => assumeRole('ROLE', {
      aws_access_key_id: 'aaki',
      aws_secret_access_key: 'asak',
      aws_session_token: 'ast',
      region: 'r',
    })).rejects.toThrow("Issue during assuming role: ERROR");
  });
});