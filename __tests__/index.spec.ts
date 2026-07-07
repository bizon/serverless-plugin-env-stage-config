/* eslint-disable unicorn/filename-case -- `__tests__` is the Jest test-directory convention */
import path from 'node:path'
import {fileURLToPath} from 'node:url'

import {describe, expect, it} from '@jest/globals'

import EnvironmentStageConfigServerlessPlugin from '../src/index.js'

type ServerlessArgument = ConstructorParameters<typeof EnvironmentStageConfigServerlessPlugin>[0]

const fixturesDirectory = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures')

// Mirrors the source's `env:` fallback; template interpolation keeps XO happy.
const environmentFallback = (name: string) => `\${env:${name}, null}`

function createServerless(): {serverless: ServerlessArgument; logs: string[]} {
  const logs: string[] = []
  const serverless = {
    serviceDir: fixturesDirectory,
    service: {provider: {stage: 'dev'}},
    cli: {
      log(message: string) {
        logs.push(message)
      },
    },
  }

  return {serverless, logs}
}

describe('EnvironmentStageConfigServerlessPlugin', () => {
  it('registers the esc configuration variables source', () => {
    const {serverless} = createServerless()
    const plugin = new EnvironmentStageConfigServerlessPlugin(serverless, {stage: 'dev'})

    expect(plugin.configurationVariablesSources.esc.resolve).toBeInstanceOf(Function)
  })

  describe('development stages', () => {
    it.each(['local', 'dev', 'development'])(
      'falls back to env for the %s stage',
      async (stage) => {
        const {serverless} = createServerless()
        const plugin = new EnvironmentStageConfigServerlessPlugin(serverless, {stage})

        await expect(plugin.resolveConfigVariable({address: 'MYSQL_HOST'})).resolves.toEqual({
          value: environmentFallback('MYSQL_HOST'),
        })
      },
    )
  })

  describe('non-development stages', () => {
    it('resolves plain variables from the stage config file', async () => {
      const {serverless} = createServerless()
      const plugin = new EnvironmentStageConfigServerlessPlugin(serverless, {stage: 'prod'})

      await expect(plugin.resolveConfigVariable({address: 'MYSQL_HOST'})).resolves.toEqual({
        value: 'db.example.com',
      })
    })

    it('resolves CloudFormation intrinsics from the stage config file', async () => {
      const {serverless} = createServerless()
      const plugin = new EnvironmentStageConfigServerlessPlugin(serverless, {stage: 'prod'})

      await expect(plugin.resolveConfigVariable({address: 'QUEUE_URL'})).resolves.toEqual({
        value: {Ref: 'MyQueue'},
      })
    })

    it('warns and falls back to env for undefined variables', async () => {
      const {serverless, logs} = createServerless()
      const plugin = new EnvironmentStageConfigServerlessPlugin(serverless, {stage: 'prod'})

      await expect(plugin.resolveConfigVariable({address: 'MISSING'})).resolves.toEqual({
        value: environmentFallback('MISSING'),
      })
      expect(logs).toHaveLength(1)
      expect(logs[0]).toContain('MISSING')
    })
  })
})
