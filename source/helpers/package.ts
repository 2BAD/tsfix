import debug from 'debug'
import { accessSync, constants } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { type PackageJson } from 'type-fest'

const log = debug('tsfix:package')

/**
 * Finds the absolute path of the package.json file in the current working directory (cwd).
 *
 * @param [cwd] - The optional current working directory. If not provided, the default is process.cwd().
 */
export const findPackageJson = (cwd?: string): string | null => {
  const packageJsonPath = resolve(cwd ?? process.cwd(), 'package.json')

  try {
    accessSync(packageJsonPath, constants.F_OK)
    log('Found package.json at: %s', packageJsonPath)
    return packageJsonPath
  } catch (error) {
    console.error('Unable to find package.json: ', error)
    return null
  }
}

/**
 * Retrieves all package dependencies from a given path.
 */
export const getPackageDependencies = async (): Promise<string[]> => {
  const path = findPackageJson()
  if (!path) return []

  try {
    const packageData = await readFile(path, 'utf-8')
    const packageJson = JSON.parse(packageData) as PackageJson
    const dependencies = packageJson.dependencies ?? {}
    const devDependencies = packageJson.devDependencies ?? {}
    const allDependencies = Object.keys({ ...dependencies, ...devDependencies })

    log('Found dependencies: %o', allDependencies)
    return allDependencies
  } catch (error) {
    console.error('Error reading package.json: ', error)
    return []
  }
}
