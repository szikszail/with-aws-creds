# with-aws-creds

![Downloads](https://img.shields.io/npm/dw/with-aws-creds?style=flat-square)
![Version@npm](https://img.shields.io/npm/v/with-aws-creds?label=version%40npm&style=flat-square)
![Version@git](https://img.shields.io/github/package-json/v/szikszail/with-aws-creds/master?label=version%40git&style=flat-square)
![CI](https://img.shields.io/github/workflow/status/szikszail/with-aws-creds/CI/master?label=ci&style=flat-square)
![Docs](https://img.shields.io/github/workflow/status/szikszail/with-aws-creds/Docs/master?label=docs&style=flat-square)

A CLI tool to run a command with your AWS credentials set as environment variables.

The tool will set ALL key/values from the selected profile from the **AWS Credentails** file as environment variables, where:

1. The environment variable names are in UPPERCASE
1. The profile selected is either the one set in the `AWS_PROFILE` environment variable, or the `default`, or if non match, and there is only one profile, then that.

## Usage

Install the tool globally:

```shell
npm install -g with-aws-creds
```

Use the `with-aws-creds` command to execute any commands:

```shell
with-aws-creds yarn test
```

**NOTE** then when you want to execute a command which has command line arguments in quotes, set the whole command in apostrophs:

```shell
with-aws-creds "node -e \"console.log(process.env.AWS_ACCESS_KEY_ID)\""
```

### Additional properties

If you would like to set additional temporary environment variables to your command, set them right before your command as command-line arguments **with values**:

```shell
with-aws-creds --aws_account_id=123 "node -e \"console.log(process.env.AWS_ACCOUNT_ID)\""
# or
# with-aws-creds --aws_account_id 123 "node -e \"console.log(process.env.AWS_ACCOUNT_ID)\""
```

**Important!** ensure that all parameters you set has a value!

For detailed documentation see the [TypeDocs documentation](https://szikszail.github.io/with-aws-creds/).
