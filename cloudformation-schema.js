// Ported from Serverless Framework's @serverless/utils (MIT), which osls also
// vendors internally. See https://github.com/oss-serverless/osls/issues/147

import yaml from 'js-yaml'

// CloudFormation intrinsic functions that can appear as YAML tags (e.g. `!Ref`,
// `!GetAtt`, `!Sub`) in serverless.env.<stage>.yml files.
const functionNames = [
  'And',
  'Base64',
  'Cidr',
  'Condition',
  'Equals',
  'FindInMap',
  'GetAtt',
  'GetAZs',
  'If',
  'ImportValue',
  'Join',
  'Not',
  'Or',
  'Ref',
  'Select',
  'Split',
  'Sub',
]

const yamlType = (name, kind) => {
  const functionName = ['Ref', 'Condition'].includes(name) ? name : `Fn::${name}`
  return new yaml.Type(`!${name}`, {
    kind,
    construct(data) {
      // Special GetAtt dot syntax: `!GetAtt Resource.Attribute`
      if (name === 'GetAtt' && typeof data === 'string') {
        const [first, ...tail] = data.split('.')
        data = [first, tail.join('.')]
      }

      return {[functionName]: data}
    },
  })
}

const types = functionNames.flatMap((functionName) =>
  ['mapping', 'scalar', 'sequence'].map((kind) => yamlType(functionName, kind)),
)

const cloudformationSchema = yaml.DEFAULT_SCHEMA.extend(types)

export default cloudformationSchema
