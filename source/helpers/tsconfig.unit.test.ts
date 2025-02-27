// biome-ignore lint/style/noNamespaceImport: needed for mocking
import * as typescript from 'typescript'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { findOutDir } from './tsconfig.js'

vi.mock('typescript', async () => {
  const actual = await vi.importActual('typescript')
  return {
    ...actual,
    findConfigFile: vi.fn(),
    readConfigFile: vi.fn(),
    parseJsonConfigFileContent: vi.fn()
  }
})

describe('findBuildDir', () => {
  const ts = typescript as unknown as {
    findConfigFile: ReturnType<typeof vi.fn>
    readConfigFile: ReturnType<typeof vi.fn>
    parseJsonConfigFileContent: ReturnType<typeof vi.fn>
    sys: { fileExists: () => boolean; readFile: () => string }
  }

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('should throw an error if tsconfig file is not found', () => {
    expect.assertions(2)

    ts.findConfigFile.mockReturnValueOnce(undefined)

    expect(() => findOutDir()).toThrow('Unable to locate tsconfig')
    expect(ts.findConfigFile).toHaveBeenCalledTimes(1)
  })

  it('should throw an error if outDir is not specified in tsconfig', () => {
    expect.assertions(3)

    ts.findConfigFile.mockReturnValueOnce('/path/to/tsconfig.json')
    ts.readConfigFile.mockReturnValueOnce({
      config: {
        compilerOptions: {}
      }
    })
    ts.parseJsonConfigFileContent.mockReturnValueOnce({
      options: {}
    })

    expect(() => findOutDir()).toThrow('No outDir specified in tsconfig')
    expect(ts.findConfigFile).toHaveBeenCalledTimes(1)
    expect(ts.readConfigFile).toHaveBeenCalledTimes(1)
  })

  it('should return the outDir specified in tsconfig', () => {
    expect.assertions(1)

    const outDir = '/path/to/build'

    ts.findConfigFile.mockReturnValueOnce('/path/to/tsconfig.json')
    ts.readConfigFile.mockReturnValueOnce({
      config: {
        compilerOptions: {
          outDir
        }
      }
    })
    ts.parseJsonConfigFileContent.mockReturnValueOnce({
      options: {
        outDir
      }
    })

    const buildDir = findOutDir()
    expect(buildDir).toStrictEqual(outDir)
  })
})
