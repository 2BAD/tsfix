type ImportType = 'relative' | 'alias' | 'package' | 'builtin'

export type ParsedImport = {
  import: string
  specifier: string
  type: ImportType
  extension: string | null
}
