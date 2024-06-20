import debug from 'debug'
import { dirname } from 'pathe'
import { findConfigFile, parseJsonConfigFileContent, readConfigFile, sys } from 'typescript'

const log = debug('tsfix:tsconfig')

/**
 * Retrieves the build directory specified in the tsconfig file.
 *
 * @throws {Error} If tsconfig file is not found or if no outDir is specified.
 */
export const findOutDir = (): string => {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const tsconfigPath = findConfigFile(process.cwd(), sys.fileExists)
  log('Found tsconfig.json at: %s', tsconfigPath)

  if (!tsconfigPath) {
    throw new Error('Unable to locate tsconfig')
  }

  // eslint-disable-next-line @typescript-eslint/unbound-method
  const tsconfigFile = readConfigFile(tsconfigPath, sys.readFile)
  const parsedTsconfig = parseJsonConfigFileContent(tsconfigFile.config, sys, dirname(tsconfigPath))

  if (parsedTsconfig.options.outDir) {
    log('Found outDir: %s', parsedTsconfig.options.outDir)
    return parsedTsconfig.options.outDir
  }

  throw new Error('No outDir specified in tsconfig')
}
