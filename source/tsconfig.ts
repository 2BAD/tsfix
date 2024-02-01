/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable import/no-named-as-default-member */

import { dirname } from 'node:path'
import ts from 'typescript'
const { findConfigFile, parseJsonConfigFileContent, readConfigFile, sys } = ts

/**
 * Retrieves the build directory specified in the tsconfig file.
 *
 * @throws {Error} If tsconfig file is not found or if no outDir is specified.
 */
export const findBuildDir = (): string => {
  const tsconfigPath = findConfigFile(process.cwd(), sys.fileExists)

  if (typeof tsconfigPath !== 'string') {
    throw new Error('Unable to locate tsconfig')
  }

  const tsconfigFile = readConfigFile(tsconfigPath, sys.readFile)
  const parsedTsconfig = parseJsonConfigFileContent(tsconfigFile.config, sys, dirname(tsconfigPath))

  if (parsedTsconfig.options.outDir !== undefined) {
    return parsedTsconfig.options.outDir
  }

  throw new Error('No outDir specified in tsconfig')
}
