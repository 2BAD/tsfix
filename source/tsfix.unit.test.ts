// eslint-disable-next-line import-x/no-named-as-default
import glob from 'fast-glob'
import { Readable } from 'node:stream'
import { afterEach, describe, expect, it, vi } from 'vitest'
// biome-ignore lint/style/noNamespaceImport: needed for mocking
import * as options from './helpers/options.js'
// biome-ignore lint/style/noNamespaceImport: needed for mocking
import * as pkg from './helpers/package.js'
// biome-ignore lint/style/noNamespaceImport: needed for mocking
import * as processor from './processor.js'
import { tsFix } from './tsfix.js'

describe('tsFix', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should get package dependencies', async () => {
    expect.assertions(1)

    vi.spyOn(console, 'log').mockReturnValue(undefined)
    const getPackageDependenciesSpy = vi.spyOn(pkg, 'getPackageDependencies')

    await tsFix({})
    expect(getPackageDependenciesSpy).toHaveBeenCalledTimes(1)
  })

  it('should setup options with provided args', async () => {
    expect.assertions(1)

    vi.spyOn(console, 'log').mockReturnValue(undefined)
    const setupOptionsSpy = vi.spyOn(options, 'setupOptions')
    const args = { pattern: '*.js', cwd: '/src' }

    await tsFix(args)

    expect(setupOptionsSpy).toHaveBeenCalledWith(args)
  })

  it('should process files found by the glob stream', async () => {
    expect.assertions(3)

    vi.spyOn(console, 'log').mockReturnValue(undefined)
    const dependencies = ['dependency1', 'dependency2']
    const files = ['file1.ts', 'file2.ts']
    vi.spyOn(glob, 'stream').mockReturnValue(Readable.from(files))
    vi.spyOn(pkg, 'getPackageDependencies').mockResolvedValue(dependencies)
    const processFileSpy = vi.spyOn(processor, 'processFile').mockResolvedValue()

    // Mock setupOptions to return default mode
    vi.spyOn(options, 'setupOptions').mockReturnValue({
      pattern: '*.js',
      mode: 'regex',
      options: {
        absolute: true,
        baseNameMatch: true,
        braceExpansion: true,
        ignore: ['**/node_modules/**'],
        cwd: '/default/output/dir'
      }
    })

    await tsFix({})

    expect(processFileSpy).toHaveBeenCalledTimes(2)
    expect(processFileSpy).toHaveBeenCalledWith('file1.ts', dependencies, 'regex')
    expect(processFileSpy).toHaveBeenCalledWith('file2.ts', dependencies, 'regex')
  })

  it('should process files with AST mode when specified', async () => {
    expect.assertions(3)

    vi.spyOn(console, 'log').mockReturnValue(undefined)
    const dependencies = ['dependency1', 'dependency2']
    const files = ['file1.ts', 'file2.ts']
    vi.spyOn(glob, 'stream').mockReturnValue(Readable.from(files))
    vi.spyOn(pkg, 'getPackageDependencies').mockResolvedValue(dependencies)
    const processFileSpy = vi.spyOn(processor, 'processFile').mockResolvedValue()

    // Mock setupOptions to return AST mode
    vi.spyOn(options, 'setupOptions').mockReturnValue({
      pattern: '*.js',
      mode: 'ast',
      options: {
        absolute: true,
        baseNameMatch: true,
        braceExpansion: true,
        ignore: ['**/node_modules/**'],
        cwd: '/default/output/dir'
      }
    })

    await tsFix({ mode: 'ast' })

    expect(processFileSpy).toHaveBeenCalledTimes(2)
    expect(processFileSpy).toHaveBeenCalledWith('file1.ts', dependencies, 'ast')
    expect(processFileSpy).toHaveBeenCalledWith('file2.ts', dependencies, 'ast')
  })
})
