import debug from 'debug'
import { dirname, join } from 'pathe'
import { findConfigFile, parseJsonConfigFileContent, readConfigFile, sys } from 'typescript'
import type { PathAliasMap } from '~/types.ts'

const log = debug('tsfix:tsconfig')

type TSConfig = {
  tsconfigPath: string
  parsedConfig: ReturnType<typeof parseJsonConfigFileContent>
}

/**
 * Load tsconfig.json file and parse it
 *
 * @throws {Error} If tsconfig file is not found
 */
export const loadTSConfig = (): TSConfig => {
  const tsconfigPath = findConfigFile(process.cwd(), sys.fileExists)
  log('Found tsconfig.json at: %s', tsconfigPath)

  if (!tsconfigPath) {
    throw new Error('Unable to locate tsconfig')
  }

  const tsconfigFile = readConfigFile(tsconfigPath, sys.readFile)
  const parsedConfig = parseJsonConfigFileContent(tsconfigFile.config, sys, dirname(tsconfigPath))

  return { tsconfigPath, parsedConfig }
}

/**
 * Retrieves the build directory specified in the tsconfig file.
 *
 * @throws {Error} If tsconfig file is not found or if no outDir is specified.
 */
export const findOutDir = (): string => {
  const { parsedConfig } = loadTSConfig()

  if (parsedConfig.options.outDir) {
    log('Found outDir: %s', parsedConfig.options.outDir)
    return parsedConfig.options.outDir
  }

  throw new Error('No outDir specified in tsconfig')
}

/**
 * Extracts path mappings from tsconfig.json
 *
 * @returns Object with alias paths or null if no paths are configured
 */
export const getPathAliases = (): PathAliasMap | null => {
  const { parsedConfig } = loadTSConfig()
  const paths = parsedConfig.options.paths
  const outDir = parsedConfig.options.outDir || '.'

  if (!paths) {
    log('No path aliases found in tsconfig.json')
    return null
  }

  // Convert relative paths to absolute
  const resolvedPaths: PathAliasMap = {}
  for (const [alias, targets] of Object.entries(paths)) {
    // Remove wildcards for processing (e.g., '@/*' -> '@/')
    const cleanAlias = alias.replace(/\*$/, '')

    // Resolve target paths relative to outDir
    const resolvedTargets = targets.map((target) => {
      // Remove wildcards from targets
      const cleanTarget = target.replace(/\*$/, '')
      return join(outDir, cleanTarget)
    })

    resolvedPaths[cleanAlias] = resolvedTargets
  }

  log('Found path aliases: %o', resolvedPaths)
  return resolvedPaths
}
