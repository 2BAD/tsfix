/**
 * Type guard that checks if a value is not null.
 *
 * @param e - The value to be checked.
 */
export const notNull = <T>(e: T | null): e is Exclude<typeof e, null> => e !== null

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
