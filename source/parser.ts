import { isBuiltin } from 'node:module'
import { extname } from 'node:path'
import { type Except } from 'type-fest'
import { IMPORT_TYPE, type ParsedImport } from './types.ts'
import { notNull } from './utils.ts'

const IMPORT_REGEX = /import\s+(?:{[^{}]+}|.*?)\s*(?:from)?\s*['"](.*?)['"]|import\(.*?\)/gm
const IMPORT_REGEX_CAPTURING = /import\s+(?:{[^{}]+}|.*?)\s*(?:from)?\s*['"](?<specifier>.*?)['"]/
const DYNAMIC_IMPORT_REGEX_CAPTURING = /import\(['"](?<specifier>.*?)['"]\)/

/**
 * Extracts the specifier from an import statement using a regular expression.
 *
 * @param statement - The import statement.
 */
export const extractSpecifier = (statement: string): Except<ParsedImport, 'type' | 'extension'> | null => {
  const result = statement.match(IMPORT_REGEX_CAPTURING) ?? statement.match(DYNAMIC_IMPORT_REGEX_CAPTURING)
  return result?.groups?.['specifier']
    ? {
        import: statement,
        specifier: result.groups['specifier']
      }
    : null
}

/**
 * Detects the type of import specifier - whether it is a npm package, relative import or an alias.
 *
 * @param dependencies - An array of dependencies to check against.
 */
export const detectSpecifierType = (dependencies: string[] = []) => {
  return (i: Except<ParsedImport, 'type' | 'extension'>): Except<ParsedImport, 'extension'> => {
    switch (true) {
      case dependencies.includes(i.specifier):
        return { ...i, type: IMPORT_TYPE.PACKAGE }
      case isBuiltin(i.specifier):
        return { ...i, type: IMPORT_TYPE.BUILTIN }
      default:
        return { ...i, type: IMPORT_TYPE.RELATIVE }
    }
  }
}

/**
 * Detects the file extension of a given import specifier.
 *
 * @param i - ParsedImport object.
 */
export const detectFileExtension = (i: Except<ParsedImport, 'extension'>): ParsedImport => {
  return { ...i, extension: extname(i.specifier) || null }
}

/**
 * Parses the import statements from the given content string.
 *
 * @param code - The source code string.
 * @param dependencies - List of package dependencies
 */
export const parseImports = (code: string, dependencies: string[]): ParsedImport[] => {
  const statements = code.match(IMPORT_REGEX)
  return statements
    ? statements.map(extractSpecifier).filter(notNull).map(detectSpecifierType(dependencies)).map(detectFileExtension)
    : []
}
