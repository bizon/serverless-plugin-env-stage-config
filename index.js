const path = require('path')
const {readFileSync} = require('fs')
const yaml = require('js-yaml')

const developmentStages = new Set([
  'local',
  'development',
  'dev'
])

class EnvStageConfigServerlessPlugin {
  constructor(serverless, options) {
    this.serverless = serverless
    this.options = options
    this.stage = options.stage ?? serverless.service.provider.stage

    this.configurationVariablesSources = {
      esc: {
        resolve: this.resolveConfigVariable.bind(this)
      }
    }

    if (!developmentStages.has(this.stage)) {
      this.stageVariables = yaml.load(
        readFileSync(
          path.join(this.serverless.serviceDir, `serverless.env.${this.stage}.yml`)
        )
      )
    }
  }

  async resolveConfigVariable({address}) {
    if (this.stageVariables) {
      if (address in this.stageVariables) {
        return {
          value: this.stageVariables[address]
        }
      }

      this.serverless.cli.log(
        `env-stage-config: WARNING: the ${address} variable is not defined in serverless.env.${this.stage}.yml, defaulting to \${env:${address}}.`,
        null,
        {color: 'orange'}
      )
    }

    return {
      value: `\${env:${address}}`
    }
  }
}

module.exports = EnvStageConfigServerlessPlugin
