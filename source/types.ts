/**
 * Type guard that checks if a value is not null.
 *
 * @param e - The value to be checked.
 */
export const notNull = <T>(e: T | null): e is Exclude<typeof e, null> => e !== null

export const IMPORT_TYPE = {
  ABSOLUTE: 'absolute',
  RELATIVE: 'relative',
  BUILTIN: 'builtin',
  PACKAGE: 'package',
  ALIAS: 'alias'
} as const

export type Import = {
  source: string
  specifier: string
  type: (typeof IMPORT_TYPE)[keyof typeof IMPORT_TYPE]
  extension: string | null
}
