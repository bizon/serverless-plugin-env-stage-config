const {readFileSync} = require('node:fs')
const path = require('node:path')

const cloudformationSchema = require('@serverless/utils/cloudformation-schema')
const yaml = require('js-yaml')

const developmentStages = new Set([
  'local',
  'development',
  'dev',
])

class EnvStageConfigServerlessPlugin {
  constructor(serverless, options) {
    this.serverless = serverless
    this.options = options
    this.stage = options.stage ?? serverless.service.provider.stage

    this.configurationVariablesSources = {
      esc: {
        resolve: this.resolveConfigVariable.bind(this),
      },
    }

    if (!developmentStages.has(this.stage)) {
      const stageConfigYaml = readFileSync(path.join(this.serverless.serviceDir, `serverless.env.${this.stage}.yml`))

      this.stageVariables = yaml.load(stageConfigYaml, {
        schema: cloudformationSchema,
      })
    }
  }

  async resolveConfigVariable({address}) {
    if (this.stageVariables) {
      if (address in this.stageVariables) {
        return {
          value: this.stageVariables[address],
        }
      }

      this.serverless.cli.log(
        `env-stage-config: WARNING: the ${address} variable is not defined in serverless.env.${this.stage}.yml, defaulting to \${env:${address}, null}.`,
        null,
        {color: 'orange'},
      )
    }

    return {
      value: `\${env:${address}, null}`,
    }
  }
}

module.exports = EnvStageConfigServerlessPlugin
