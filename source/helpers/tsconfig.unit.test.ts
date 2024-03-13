import * as ts from 'typescript'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { findBuildDir } from './tsconfig.ts'

describe('findBuildDir', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should throw an error if tsconfig file is not found', () => {
    expect.assertions(2)

    const findConfigFileSpy = vi.spyOn(ts, 'findConfigFile').mockReturnValueOnce(undefined)

    expect(() => findBuildDir()).toThrow('Unable to locate tsconfig')
    expect(findConfigFileSpy).toHaveBeenCalledTimes(1)
  })

  it('should throw an error if outDir is not specified in tsconfig', () => {
    expect.assertions(3)

    const findConfigFileSpy = vi.spyOn(ts, 'findConfigFile').mockReturnValueOnce('/path/to/tsconfig.json')

    const readConfigFileSpy = vi.spyOn(ts, 'readConfigFile').mockReturnValueOnce({
      config: {
        compilerOptions: {}
      }
    })

    expect(() => findBuildDir()).toThrow('No outDir specified in tsconfig')
    expect(findConfigFileSpy).toHaveBeenCalledTimes(1)
    expect(readConfigFileSpy).toHaveBeenCalledTimes(1)
  })

  it('should return the outDir specified in tsconfig', () => {
    expect.assertions(1)

    const outDir = '/path/to/build'

    vi.spyOn(ts, 'findConfigFile').mockReturnValueOnce('/path/to/tsconfig.json')

    const readConfigFileSpy = vi.spyOn(ts, 'readConfigFile')
    readConfigFileSpy.mockReturnValueOnce({
      config: {
        compilerOptions: {
          outDir
        }
      }
    })

    const buildDir = findBuildDir()
    expect(buildDir).toStrictEqual(outDir)
  })
})
