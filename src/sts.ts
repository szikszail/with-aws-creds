import * as sts from "@aws-sdk/client-sts";
import { Credentials } from "./credentials";
import { v4 } from "uuid";

export async function assumeRole(roleArn: string, credentials: Credentials): Promise<Credentials> {
  if (!roleArn) {
    throw new Error('Role ARN is not set!');
  }
  if (!credentials.aws_access_key_id || !credentials.aws_secret_access_key) {
    throw new Error('AWS Credentials are not set!');
  }

  const client = new sts.STSClient({
    credentials: {
      accessKeyId: credentials.aws_access_key_id,
      secretAccessKey: credentials.aws_secret_access_key,
      sessionToken: credentials.aws_session_token,
    },
    region: credentials.region
  });
  const roleSessionName = `with-aws-creds-${v4()}`;
  const command = new sts.AssumeRoleCommand({
    RoleArn: roleArn,
    RoleSessionName: roleSessionName,
  })

  try {
    const data = await client.send(command);
    return {
      aws_access_key_id: data.Credentials.AccessKeyId,
      aws_secret_access_key: data.Credentials.SecretAccessKey,
      aws_session_token: data.Credentials.SessionToken,
      aws_role_session_name: roleSessionName,
    };
  } catch (error) {
    throw new Error('Issue during assuming role: ' + error);
  }
}