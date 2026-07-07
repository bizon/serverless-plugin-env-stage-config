import {readFileSync} from 'node:fs'
import path from 'node:path'

import yaml from 'js-yaml'

import {cloudformationSchema} from './cloudformation-schema.js'

const developmentStages = new Set(['local', 'development', 'dev'])

interface ServerlessOptions {
  stage?: string
}

interface Serverless {
  serviceDir: string
  service: {
    provider: {
      stage: string
    }
  }
  cli: {
    log(message: string, entity?: string, options?: {color?: string}): void
  }
}

interface ConfigVariableSource {
  address: string
}

export default class EnvironmentStageConfigServerlessPlugin {
  serverless: Serverless
  options: ServerlessOptions
  stage: string
  stageVariables: Record<string, unknown> | undefined
  configurationVariablesSources: {
    esc: {
      resolve: (source: ConfigVariableSource) => Promise<{value: unknown}>
    }
  }

  constructor(serverless: Serverless, options: ServerlessOptions) {
    this.serverless = serverless
    this.options = options
    this.stage = options.stage ?? serverless.service.provider.stage

    this.configurationVariablesSources = {
      esc: {
        resolve: this.resolveConfigVariable.bind(this),
      },
    }

    if (!developmentStages.has(this.stage)) {
      const stageConfigYaml = readFileSync(
        path.join(this.serverless.serviceDir, `serverless.env.${this.stage}.yml`),
        'utf8',
      )

      // YAML load returns `unknown`; a stage config file is always a mapping.
      this.stageVariables = yaml.load(stageConfigYaml, {
        schema: cloudformationSchema,
      }) as Record<string, unknown>
    }
  }

  async resolveConfigVariable({address}: ConfigVariableSource) {
    if (this.stageVariables) {
      if (Object.hasOwn(this.stageVariables, address)) {
        return {
          value: this.stageVariables[address],
        }
      }

      this.serverless.cli.log(
        `env-stage-config: WARNING: the ${address} variable is not defined in serverless.env.${this.stage}.yml, defaulting to \${env:${address}, null}.`,
        undefined,
        {color: 'orange'},
      )
    }

    return {
      value: `\${env:${address}, null}`,
    }
  }
}
