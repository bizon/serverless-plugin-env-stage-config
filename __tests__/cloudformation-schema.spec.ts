/* eslint-disable unicorn/filename-case -- `__tests__` is the Jest test-directory convention */
import {describe, expect, it} from '@jest/globals'
import yaml from 'js-yaml'

import {cloudformationSchema} from '../src/cloudformation-schema.js'

const load = (input: string) => yaml.load(input, {schema: cloudformationSchema})

describe('cloudformationSchema', () => {
  it('resolves !Ref without the Fn:: prefix', () => {
    expect(load('Value: !Ref MyQueue')).toEqual({Value: {Ref: 'MyQueue'}})
  })

  it('resolves !Condition without the Fn:: prefix', () => {
    expect(load('Value: !Condition IsProd')).toEqual({Value: {Condition: 'IsProd'}})
  })

  it('resolves scalar function tags to Fn::* intrinsics', () => {
    expect(load('Value: !GetAZs eu-west-1')).toEqual({Value: {'Fn::GetAZs': 'eu-west-1'}})
  })

  it('splits the !GetAtt dot syntax into resource and attribute', () => {
    expect(load('Value: !GetAtt MyQueue.Arn')).toEqual({
      Value: {'Fn::GetAtt': ['MyQueue', 'Arn']},
    })
  })

  it('keeps nested attributes on the !GetAtt attribute side', () => {
    expect(load('Value: !GetAtt MyResource.Outputs.Url')).toEqual({
      Value: {'Fn::GetAtt': ['MyResource', 'Outputs.Url']},
    })
  })

  it('supports sequence and mapping tag forms', () => {
    expect(load('Value: !Join ["-", [a, b]]')).toEqual({Value: {'Fn::Join': ['-', ['a', 'b']]}})
    expect(load('Value: !FindInMap {a: b}')).toEqual({Value: {'Fn::FindInMap': {a: 'b'}}})
  })
})
