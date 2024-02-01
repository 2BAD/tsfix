import { notNull } from './utils.ts'

const IMPORT_REGEX = /import\s+(?:{[^{}]+}|.*?)\s*(?:from)?\s*['"](.*?)['"]|import\(.*?\)/gm
const IMPORT_REGEX_CAPTURING = /import\s+(?:{[^{}]+}|.*?)\s*(?:from)?\s*['"](?<specifier>.*?)['"]/
const DYNAMIC_IMPORT_REGEX_CAPTURING = /import\(['"](?<specifier>.*?)['"]\)/

type ParsedImport = {
  import: string
  specifier: string
}

/**
 * Extracts the specifier from an import statement using a regular expression.
 *
 * @param statement - The import statement.
 */
export const extractSpecifier = (statement: string): ParsedImport | null => {
  const result = statement.match(IMPORT_REGEX_CAPTURING) ?? statement.match(DYNAMIC_IMPORT_REGEX_CAPTURING)
  return result?.groups?.['specifier'] !== undefined
    ? {
        import: statement,
        specifier: result.groups['specifier']
      }
    : null
}

/**
 * Parses the imports from the given content string.
 *
 * @param code - The source code string.
 */
export const parseImports = (code: string): ParsedImport[] => {
  const statements = code.match(IMPORT_REGEX)
  return statements !== null ? statements.map(extractSpecifier).filter(notNull) : []
}
