import { Credentials } from "../credentials";

export async function assumeRole(roleArn: string, credentails: Credentials): Promise<Credentials> {
  return {
    ...credentails,
    role: roleArn,
  };
}