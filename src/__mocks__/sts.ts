export async function assumeRole(roleArn: string, credentails: any): Promise<any> {
  return {
    ...credentails,
    role: roleArn,
  };
}