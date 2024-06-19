import debug from 'debug'
import { isBuiltin } from 'node:module'
import { extname } from 'node:path'
import { type Except } from 'type-fest'
import { IMPORT_TYPE, notNull, type Import } from './types.ts'

const log = debug('tsfix:extractor')

const IMPORT_REGEX = /(?:import|export)\s+(?:{[^{}]+}|.*?)\s*(?:from)?\s*['"](.*?)['"]|import\(.*?\)/gm
const IMPORT_REGEX_CAPTURING = /(?:import|export)\s+(?:{[^{}]+}|.*?)\s*(?:from)?\s*['"](?<specifier>.*?)['"]/
// TODO: should be updated to handle import attributes through a second argument
const DYNAMIC_IMPORT_REGEX_CAPTURING = /import\(['"](?<specifier>.*?)['"]\)/

/**
 * Extracts the specifier from an import statement using a regular expression.
 *
 * @param statement - The import statement.
 */
export const extractSpecifier = (statement: string): Except<Import, 'type' | 'extension'> | null => {
  const result = statement.match(IMPORT_REGEX_CAPTURING) ?? statement.match(DYNAMIC_IMPORT_REGEX_CAPTURING)
  return result?.groups?.['specifier']
    ? {
        source: statement,
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
  return (i: Except<Import, 'type' | 'extension'>): Except<Import, 'extension'> => {
    switch (true) {
      case i.specifier.startsWith('/'):
        return { ...i, type: IMPORT_TYPE.ABSOLUTE }
      case i.specifier.startsWith('.'):
        return { ...i, type: IMPORT_TYPE.RELATIVE }
      case isBuiltin(i.specifier):
        return { ...i, type: IMPORT_TYPE.BUILTIN }
      case dependencies.includes(i.specifier):
        return { ...i, type: IMPORT_TYPE.PACKAGE }
      default:
        return { ...i, type: IMPORT_TYPE.ALIAS }
    }
  }
}

/**
 * Detects the file extension of a given import specifier.
 *
 * @param i - ParsedImport object.
 */
export const detectFileExtension = (i: Except<Import, 'extension'>): Import => {
  return { ...i, extension: extname(i.specifier) || null }
}

/**
 * Parses the import statements from the given code string.
 *
 * @param code - The source code string.
 * @param dependencies - List of package dependencies
 */
export const extractImports = (code: string, dependencies: string[]): Import[] => {
  const statements = code.match(IMPORT_REGEX)
  if (statements === null || statements.length === 0) {
    return []
  } else {
    const imports = statements
      .map(extractSpecifier)
      .filter(notNull)
      .map(detectSpecifierType(dependencies))
      .map(detectFileExtension)

    log('Found %d imports statements: %o', imports.length, imports)
    return imports
  }
}
