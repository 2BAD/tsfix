import glob from 'fast-glob'
import { Readable } from 'node:stream'
import { afterEach, describe, expect, it, vi } from 'vitest'
import * as options from './helpers/options.js'
import * as pkg from './helpers/package.js'
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

    await tsFix({})

    expect(processFileSpy).toHaveBeenCalledTimes(2)
    expect(processFileSpy).toHaveBeenCalledWith('file1.ts', dependencies)
    expect(processFileSpy).toHaveBeenCalledWith('file2.ts', dependencies)
  })
})
