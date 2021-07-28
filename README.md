# serverless-plugin-env-stage-config

This [Serverless](http://www.serverless.com/) plugin allows to define environment variable configuration files for stages.
It exposes a new variable resolver (`$esc`) that automatically picks the correct value based on the selected stage.
For development stages (`local`, `dev`, `development`), the variables will default to the system’s environment variables.

## Installation

```sh
yarn add --dev serverless-plugin-env-stage-config
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

provider:
  name: aws

  environment:
    MYSQL_HOST: ${esc:MYSQL_HOST}
    MYSQL_PORT: ${esc:MYSQL_PORT}

functions:
  run-something:
    handler: handler.run
    environment:
      SECRET_TOKEN: ${esc:SECRET_TOKEN}
```

# Local stages

In a local environment, the variables resolved with the `esc:` prefix will be equivalent to using `env:`. Using `useDotenv: true` alongside a `.env` file will alow you to define your environement variables in the environement.

The support local stages are:
- local
- dev
- development

# Other stages

If you need to define a different source for the environement variables for your `prod` stage, you can define a `serverless.env.prod.yml` to redefine the variables.

For example, if you’re using AWS SSM Parameter Store, you could create the following file:

```yaml
MYSQL_HOST: ${ssm:/my-service/prod/MYSQL_HOST~true}
SECRET_TOKEN: ${ssm:/my-service/prod/SECRET_TOKEN~true}
```

Any variable that is not included in the `serverless.env.prod.yml` file will produce a warning and fallback to using `env:`.
In this case, you will get the following warning:

> Serverless: env-stage-config: WARNING: the MYSQL_PORT variable is not defined in serverless.env.prod.yml, defaulting to ${env:MYSQL_PORT}.

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
