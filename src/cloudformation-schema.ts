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

type YamlKind = 'mapping' | 'scalar' | 'sequence'

const kinds: YamlKind[] = ['mapping', 'scalar', 'sequence']

const yamlType = (name: string, kind: YamlKind) => {
  const functionName = name === 'Ref' || name === 'Condition' ? name : `Fn::${name}`
  return new yaml.Type(`!${name}`, {
    kind,
    construct(data: unknown) {
      // Special GetAtt dot syntax: `!GetAtt Resource.Attribute`
      if (name === 'GetAtt' && typeof data === 'string') {
        const [first, ...tail] = data.split('.')
        return {[functionName]: [first, tail.join('.')]}
      }

      return {[functionName]: data}
    },
  })
}

const types = functionNames.flatMap((functionName) =>
  kinds.map((kind) => yamlType(functionName, kind)),
)

export const cloudformationSchema = yaml.DEFAULT_SCHEMA.extend(types)
