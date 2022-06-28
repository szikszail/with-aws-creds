# with-aws-creds

![Downloads](https://img.shields.io/npm/dw/with-aws-creds?style=flat-square)
![Version@npm](https://img.shields.io/npm/v/with-aws-creds?label=version%40npm&style=flat-square)
![Version@git](https://img.shields.io/github/package-json/v/szikszail/with-aws-creds/master?label=version%40git&style=flat-square)
![CI](https://img.shields.io/github/workflow/status/szikszail/with-aws-creds/CI/master?label=ci&style=flat-square)
![Docs](https://img.shields.io/github/workflow/status/szikszail/with-aws-creds/Docs/master?label=docs&style=flat-square)

A CLI tool to run a command with your AWS credentials set as environment variables.

The tool will set ALL key/values from the selected profile from the **AWS Credentials** file as environment variables, where:

1. The environment variable names are in UPPERCASE
1. The profile selected is either
    1. the one set in the `--aws_profile` argument, or 
    1. the one set in the `AWS_PROFILE` environment variable, or 
    1. the `default`, or
    2. if non-match, and there is only one profile, then that.

## Usage

Install the tool globally:

```shell
npm install -g with-aws-creds
```

Use the `with-aws-creds` command to execute any commands:

```shell
with-aws-creds yarn test
```

**NOTE** then when you want to execute a command which has command-line arguments in quotes, set the whole command in apostrophes:

```shell
with-aws-creds "node -e \"console.log(process.env.AWS_ACCESS_KEY_ID)\""
```

### Additional properties

If you would like to set additional temporary environment variables to your command, set them right before your command as command-line arguments **with values**:

```shell
with-aws-creds --aws_account_id=123 -- "node -e \"console.log(process.env.AWS_ACCOUNT_ID)\""
# or
# with-aws-creds --aws_account_id 123 -- "node -e \"console.log(process.env.AWS_ACCOUNT_ID)\""
```

You can also use the `--` separator argument to differentiate between the command and the arguments. Using it is optional, but it makes clear, which is the command and where arguments start.

**Important!** ensure that all parameters you set have a value!

**Note** that arguments either can be set using either underscore (`_`) or dash (`-`) instead of white-spaces, e.g. `--aws-profile`.

### STS

The tool also allows using [AWS STS](https://docs.aws.amazon.com/STS/latest/APIReference/welcome.html)](https://docs.aws.amazon.com/STS/latest/APIReference/welcome.html) to assume a given role and use the credentials during command execution. To assume a role and use that, you can use the following command:

```shell
with-aws-creds --aws_role=arn-of-the-role -- "node -e \"console.log(process.env.AWS_ACCESS_KEY_ID)\""
```

If the `aws_role` argument is set, then the tool will use the default credentials set on the host machine and will assume the role passed. If the action is successful, then the generated AWS credentials will be set in the environment variables.

### More

For detailed documentation see the [TypeDocs documentation](https://szikszail.github.io/with-aws-creds/).
