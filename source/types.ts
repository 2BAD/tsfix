export const IMPORT_TYPE = {
  RELATIVE: 'relative',
  ALIAS: 'alias',
  PACKAGE: 'package',
  BUILTIN: 'builtin'
} as const

export type ParsedImport = {
  import: string
  specifier: string
  type: (typeof IMPORT_TYPE)[keyof typeof IMPORT_TYPE]
  extension: string | null
}
