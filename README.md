# serverless-plugin-env-stage-config

[![npm version](https://badgen.net/npm/v/serverless-plugin-env-stage-config)](https://www.npmjs.com/package/serverless-plugin-env-stage-config)
[![XO code style](https://badgen.net/badge/code%20style/XO/cyan)](https://github.com/xojs/xo)

This [Serverless](https://github.com/oss-serverless/serverless) plugin allows to define environment variable configuration files for stages.
It exposes a new variable resolver (`$esc`) that automatically picks the correct value based on the selected stage.
For development stages (`local`, `dev`, `development`), the variables will default to the system’s environment variables.

> [!NOTE]  
> This plugin is designed for [Serverless Framework v3](https://github.com/oss-serverless/serverless) (published as [`osls`](https://www.npmjs.com/package/osls) on npm), which is a maintained fork of the original Serverless project.

## CI

[![Tests](https://github.com/bizon/serverless-plugin-env-stage-config/actions/workflows/tests.yml/badge.svg)](https://github.com/bizon/serverless-plugin-env-stage-config/actions/workflows/tests.yml)
[![Release](https://github.com/bizon/serverless-plugin-env-stage-config/actions/workflows/release.yml/badge.svg)](https://github.com/bizon/serverless-plugin-env-stage-config/actions/workflows/release.yml)

## Installation

```sh
pnpm add -D serverless-plugin-env-stage-config
```

```yaml
plugins:
  - serverless-plugin-env-stage-config
```

## Usage

For non-development stages, the variables will be retrieved from a `serverless.env.${stage}.yml` file, alongside the `serverless.yml`.

Let’s consider the following `serverless.yml`:

```yaml
name: my-service

useDotenv: true

resources:
  Resources:
    MyQueue:
      Type: AWS::SQS::Queue
      Properties:
        QueueName: some-queue

provider:
  name: aws

  environment:
    MYSQL_HOST: ${esc:MYSQL_HOST}
    MYSQL_PORT: ${esc:MYSQL_PORT}

functions:
  run-something:
    handler: handler.run
    environment:
      QUEUE_URL: ${esc:QUEUE_URL}
      SECRET_TOKEN: ${esc:SECRET_TOKEN}
```

## Local stages

In a local environment, the variables resolved with the `esc:` prefix will be equivalent to using `env:`. Using `useDotenv: true` alongside a `.env` file will alow you to define your environement variables.

The supported local stages are:

- `local`
- `dev`
- `development`

## Other stages

If you need to define a different source for the environement variables for your `prod` stage, you can define a `serverless.env.prod.yml` to redefine the variables.

For example, if you’re using AWS SSM Parameter Store, you could create the following file:

```yaml
MYSQL_HOST: ${ssm:/my-service/prod/MYSQL_HOST}
QUEUE_URL: !Ref MyQueue
SECRET_TOKEN: ${ssm:/my-service/prod/SECRET_TOKEN}
```

Any variable that is not included in the `serverless.env.prod.yml` file will produce a warning and fallback to using `env:`.
In this case, you will get the following warning:

> Serverless: env-stage-config: WARNING: the MYSQL_PORT variable is not defined in serverless.env.prod.yml, defaulting to ${env:MYSQL_PORT, null}.

If a variable is not defined in the stage environment configuration file, or the environment (`process.env`), it will default to `null`.

## License

MIT

## Miscellaneous

```
    ╚⊙ ⊙╝
  ╚═(███)═╝
 ╚═(███)═╝
╚═(███)═╝
 ╚═(███)═╝
  ╚═(███)═╝
   ╚═(███)═╝
```
