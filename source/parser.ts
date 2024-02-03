import { isBuiltin } from 'node:module'
import { extname } from 'node:path'
import { type ParsedImport } from './types.ts'
import { notNull } from './utils.ts'

const IMPORT_REGEX = /import\s+(?:{[^{}]+}|.*?)\s*(?:from)?\s*['"](.*?)['"]|import\(.*?\)/gm
const IMPORT_REGEX_CAPTURING = /import\s+(?:{[^{}]+}|.*?)\s*(?:from)?\s*['"](?<specifier>.*?)['"]/
const DYNAMIC_IMPORT_REGEX_CAPTURING = /import\(['"](?<specifier>.*?)['"]\)/

/**
 * Extracts the specifier from an import statement using a regular expression.
 *
 * @param statement - The import statement.
 */
const extractSpecifier = (statement: string): Omit<ParsedImport, 'type' | 'extension'> | null => {
  const result = statement.match(IMPORT_REGEX_CAPTURING) ?? statement.match(DYNAMIC_IMPORT_REGEX_CAPTURING)
  return result?.groups?.['specifier'] !== undefined
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
const detectSpecifierType = (dependencies: string[] = []) => {
  return (i: Omit<ParsedImport, 'type' | 'extension'>): Omit<ParsedImport, 'extension'> => {
    switch (true) {
      case dependencies.includes(i.specifier):
        return { ...i, type: 'package' }
      case isBuiltin(i.specifier):
        return { ...i, type: 'builtin' }
      default:
        return { ...i, type: 'relative' }
    }
  }
}

/**
 * Detects the file extension of a given import specifier.
 *
 * @param i - ParsedImport object.
 */
const detectFileExtension = (i: Omit<ParsedImport, 'extension'>): ParsedImport => {
  return { ...i, extension: extname(i.specifier) }
}

/**
 * Parses the import statements from the given content string.
 *
 * @param code - The source code string.
 * @param dependencies - List of package dependencies
 */
export const parseImports = (code: string, dependencies: string[]): ParsedImport[] => {
  const statements = code.match(IMPORT_REGEX)
  return statements !== null
    ? statements.map(extractSpecifier).filter(notNull).map(detectSpecifierType(dependencies)).map(detectFileExtension)
    : []
}
