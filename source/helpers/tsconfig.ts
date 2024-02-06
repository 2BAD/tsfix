import { dirname } from 'node:path'
import ts from 'typescript'
// eslint-disable-next-line import/no-named-as-default-member
const { findConfigFile, parseJsonConfigFileContent, readConfigFile, sys } = ts

/**
 * Retrieves the build directory specified in the tsconfig file.
 *
 * @throws {Error} If tsconfig file is not found or if no outDir is specified.
 */
export const findBuildDir = (): string => {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const tsconfigPath = findConfigFile(process.cwd(), sys.fileExists)

  if (!tsconfigPath) {
    throw new Error('Unable to locate tsconfig')
  }

  // eslint-disable-next-line @typescript-eslint/unbound-method
  const tsconfigFile = readConfigFile(tsconfigPath, sys.readFile)
  const parsedTsconfig = parseJsonConfigFileContent(tsconfigFile.config, sys, dirname(tsconfigPath))

  if (parsedTsconfig.options.outDir) {
    return parsedTsconfig.options.outDir
  }

  throw new Error('No outDir specified in tsconfig')
}
