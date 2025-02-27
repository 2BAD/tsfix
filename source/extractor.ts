import debug from 'debug'
import { isBuiltin } from 'node:module'
import { extname } from 'pathe'
import type { Except } from 'type-fest'
import {
  ScriptTarget,
  SyntaxKind,
  createSourceFile,
  forEachChild,
  isCallExpression,
  isExportDeclaration,
  isImportDeclaration,
  isStringLiteral,
  type Node
} from 'typescript'
import { IMPORT_TYPE, notNull, type Import, type Mode } from './types.js'

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
 * Extracts imports using TypeScript's AST.
 *
 * @param code - The source code string.
 * @param dependencies - List of package dependencies
 */
export const extractImportsAst = (code: string, dependencies: string[]): Import[] => {
  const sourceFile = createSourceFile('temp.ts', code, ScriptTarget.Latest, true)

  const imports: Except<Import, 'type' | 'extension'>[] = []

  /**
   * Recursively visit nodes in the AST to find imports.
   *
   * @param node - The current TypeScript AST node
   */
  const visit = (node: Node): void => {
    // Handle import declarations (import * from 'module')
    if (isImportDeclaration(node) && node.moduleSpecifier && isStringLiteral(node.moduleSpecifier)) {
      const specifier = node.moduleSpecifier.text
      imports.push({
        source: node.getText(),
        specifier
      })
    } else if (isExportDeclaration(node) && node.moduleSpecifier && isStringLiteral(node.moduleSpecifier)) {
      // Handle export declarations with module specifier (export * from 'module')
      const specifier = node.moduleSpecifier.text
      imports.push({
        source: node.getText(),
        specifier
      })
    } else if (
      isCallExpression(node) &&
      node.expression.kind === SyntaxKind.ImportKeyword &&
      node.arguments[0] &&
      isStringLiteral(node.arguments[0])
    ) {
      // Handle dynamic imports (import('module'))
      const specifier = node.arguments[0].text
      imports.push({
        source: node.getText(),
        specifier
      })
    }

    forEachChild(node, visit)
  }

  visit(sourceFile)

  const processedImports = imports.map(detectSpecifierType(dependencies)).map(detectFileExtension)

  log('Found %d imports statements using AST: %o', processedImports.length, processedImports)
  return processedImports
}

/**
 * Parses the import statements from the given code string using regex.
 *
 * @param code - The source code string.
 * @param dependencies - List of package dependencies
 */
export const extractImportsRegex = (code: string, dependencies: string[]): Import[] => {
  const statements = code.match(IMPORT_REGEX)
  if (statements === null || statements.length === 0) {
    return []
  }

  const imports = statements
    .map(extractSpecifier)
    .filter(notNull)
    .map(detectSpecifierType(dependencies))
    .map(detectFileExtension)

  log('Found %d imports statements: %o', imports.length, imports)
  return imports
}

/**
 * Parses the import statements from the given code string using the specified mode.
 *
 * @param code - The source code string.
 * @param dependencies - List of package dependencies
 * @param mode - The extraction mode ('regex' or 'ast')
 */
export const extractImports = (code: string, dependencies: string[], mode: Mode = 'regex'): Import[] => {
  return mode === 'ast' ? extractImportsAst(code, dependencies) : extractImportsRegex(code, dependencies)
}
