import { readFile } from 'node:fs/promises'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { findPackageJson, getPackageDependencies } from './package.ts'

vi.mock('node:fs/promises', () => {
  return {
    readFile: vi.fn()
  }
})

describe('findPackageJson', () => {
  it('should return the path to package.json in the current working directory', () => {
    expect.assertions(1)

    const packageJsonPath = findPackageJson()

    expect(packageJsonPath).toContain('package.json')
  })
  it('should return null when package.json is not found', () => {
    expect.assertions(2)

    const consoleErrorMock = vi.spyOn(console, 'error').mockReturnValueOnce()

    const result = findPackageJson('/invalid/path')

    expect(result).toBeNull()
    expect(consoleErrorMock).toHaveBeenCalledTimes(1)
  })
})

describe('getPackageDependencies', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should retrieve package dependencies from package.json', async () => {
    expect.assertions(1)

    const packageDataMock = JSON.stringify({
      dependencies: {
        react: '^17.0.1'
      },
      devDependencies: {
        jest: '^27.0.3'
      }
    })

    vi.mocked(readFile).mockResolvedValueOnce(packageDataMock)

    const result = await getPackageDependencies()

    expect(result).toStrictEqual(['react', 'jest'])
  })

  it("should return an empty array if package.json doesn't have any dependency", async () => {
    expect.assertions(1)

    const packageDataMock = JSON.stringify({
      name: 'test'
    })

    vi.mocked(readFile).mockResolvedValueOnce(packageDataMock)

    const result = await getPackageDependencies()

    expect(result).toStrictEqual([])
  })

  // it('should return an empty array if package.json is not found', async () => {
  //   expect.assertions(1)

  //   const result = await getPackageDependencies()
  //   expect(result).toStrictEqual([])
  // })

  it('should handle error gracefully', async () => {
    expect.assertions(2)

    vi.mocked(readFile).mockRejectedValueOnce(new Error('File read error'))
    const consoleErrorMock = vi.spyOn(console, 'error').mockReturnValueOnce()

    const dependencies = await getPackageDependencies()

    expect(dependencies).toStrictEqual([])
    expect(consoleErrorMock).toHaveBeenCalledTimes(1)
  })
})
