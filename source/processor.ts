import debug from 'debug'
import { access, constants, readFile, stat, writeFile } from 'node:fs/promises'
import { dirname, join, normalize, relative, resolve } from 'pathe'
import { extractImports } from './extractor.ts'
import { getPathAliases } from './helpers/tsconfig.ts'
import type { Import, Mode, PathAliasMap } from './types.ts'

const log = debug('tsfix:processor')

/**
 * Processes a file by extracting its imports, applying fixes, and writing the fixed code back to the file.
 *
 * @param filePath - The path to the file to be processed.
 * @param dependencies - The dependencies to be considered when extracting imports.
 * @param mode - The extraction mode ('regex' or 'ast').
 */
export const processFile = async (
  filePath: string | Buffer,
  dependencies: string[],
  mode: Mode = 'regex'
): Promise<void> => {
  const sourceCode = await readFile(filePath, 'utf-8')
  log('Extracting imports from file: %s using %s mode', filePath, mode)
  const dirPath = dirname(filePath.toString())
  const imports = extractImports(sourceCode, dependencies, mode)
  const pathAliases = getPathAliases()
  const fixedCode = await applyFixes(sourceCode, imports, dirPath, pathAliases)
  await writeFile(filePath, fixedCode)
}

/**
 * Resolves a path alias to its actual file path
 *
 * @param specifier - The import specifier
 * @param aliases - Path alias mapping from tsconfig
 */
export const resolvePathAlias = (specifier: string, aliases: PathAliasMap): string | null => {
  // Find the matching alias prefix
  const matchingAlias = Object.keys(aliases)
    .filter((aliasKey) => specifier.startsWith(aliasKey))
    .sort((a, b) => b.length - a.length)[0] // Get the longest matching alias

  if (!matchingAlias) {
    return null
  }

  // Get the first target path for the alias (typically there's only one)
  const targetPaths = aliases[matchingAlias]
  if (!targetPaths || !targetPaths[0]) {
    return null
  }

  // Replace the alias prefix with the target path
  const relativePath = specifier.slice(matchingAlias.length)
  const resolvedPath = join(targetPaths[0], relativePath)

  log('Resolved alias %s to %s', specifier, resolvedPath)
  return normalize(resolvedPath)
}

/**
 * Gets the appropriate quote character from the import source
 *
 * @param importSource - The import source string to check for quote characters
 */
const getQuoteChar = (importSource: string): string => {
  return importSource.includes("'") ? "'" : '"'
}

/**
 * Determines if a path needs the .js extension added
 *
 * @param path - The path to check
 */
const shouldAddJsExtension = (path: string): boolean => {
  return !path.endsWith('.js') && !path.endsWith('/')
}

/**
 * Check if a path is a directory and return the appropriate fixed path
 *
 * @param basePath - The base directory path to resolve against
 * @param importPath - The import path to check
 */
const determinePathType = async (basePath: string, importPath: string): Promise<string> => {
  try {
    const fullPath = resolve(basePath, importPath)
    await access(fullPath, constants.F_OK)

    const stats = await stat(fullPath)
    if (stats.isDirectory()) {
      return importPath.endsWith('/') ? `${importPath}index.js` : `${importPath}/index.js`
    }

    return shouldAddJsExtension(importPath) ? `${importPath}.js` : importPath
  } catch {
    console.warn('Not modified! Unable to determine path of imported module: ', importPath)
    return importPath
  }
}

/**
 * Replace an import specifier in the source code
 *
 * @param code - The source code to modify
 * @param oldSpecifier - The original import specifier to replace
 * @param newSpecifier - The new import specifier
 * @param quote - The quote character used in the import statement
 */
const replaceImportInCode = (code: string, oldSpecifier: string, newSpecifier: string, quote: string): string => {
  return code.replace(`${quote}${oldSpecifier}${quote}`, `${quote}${newSpecifier}${quote}`)
}

/**
 * Fixes imports in the source code by applying the necessary changes.
 *
 * @param code - The original source code.
 * @param imports - An array of parsed import objects.
 * @param dirPath - The directory path of the file being processed.
 * @param pathAliases - Path alias mappings from tsconfig, if available
 */
export const applyFixes = async (
  code: string,
  imports: Import[],
  dirPath: string,
  pathAliases: PathAliasMap | null = null
): Promise<string> => {
  let result = code

  for (const i of imports) {
    log('Processing import: %o', i)
    const quote = getQuoteChar(i.source)

    try {
      if (i.type === 'alias' && pathAliases) {
        const resolvedAliasPath = resolvePathAlias(i.specifier, pathAliases)

        if (resolvedAliasPath) {
          const relativePath = relative(dirPath, resolvedAliasPath)
          const userFriendlyPath =
            relativePath.startsWith('.') && relativePath.charAt(0) !== '/' ? relativePath : `./${relativePath}`
          const finalPath = await determinePathType(dirPath, userFriendlyPath)

          result = replaceImportInCode(result, i.specifier, finalPath, quote)
          log('Fixed alias import: %s to %s', i.specifier, finalPath)
          continue
        }
      }

      if (i.type === 'absolute' || i.type === 'relative') {
        let fixedSpecifier: string

        if (i.extension === '.ts') {
          fixedSpecifier = i.specifier.replace('.ts', '.js')
        } else {
          fixedSpecifier = await determinePathType(dirPath, i.specifier)
        }

        // Verify the path exists before making the replacement
        const importPath = resolve(dirPath, fixedSpecifier)
        try {
          await access(importPath, constants.F_OK)

          result = replaceImportInCode(result, i.specifier, fixedSpecifier, quote)
          log('Fixed import specifier: %s to %s', i.specifier, fixedSpecifier)
        } catch (_accessError) {
          console.error('Unable to find file at import path: %s', importPath)
        }
      }
    } catch (error) {
      console.error('Error processing import %s: %s', i.specifier, error)
    }
  }

  return result
}
