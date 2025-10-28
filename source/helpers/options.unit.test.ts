import { beforeEach, describe, expect, it, vi } from 'vitest'
import { setupOptions, type Args } from './options.ts'
// biome-ignore lint/style/noNamespaceImport: needed for mocking
import * as tsconfig from './tsconfig.ts'

describe('getOptions', () => {
  // eslint-disable-next-line vitest/no-hooks
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return default pattern and cwd when args is empty', () => {
    expect.assertions(2)
    const findOutDirSpy = vi.spyOn(tsconfig, 'findOutDir').mockReturnValueOnce('/default/output/dir')

    const args: Args = {}
    const result = setupOptions(args)

    expect(result).toStrictEqual({
      pattern: '*.{js}',
      mode: 'regex',
      options: {
        absolute: true,
        baseNameMatch: true,
        braceExpansion: true,
        ignore: ['**/node_modules/**'],
        cwd: '/default/output/dir'
      }
    })

    expect(findOutDirSpy).toHaveBeenCalledTimes(1)
  })

  it('should return provided pattern and default cwd', () => {
    expect.assertions(2)
    const findOutDirSpy = vi.spyOn(tsconfig, 'findOutDir').mockReturnValueOnce('/default/output/dir')

    const args: Args = { pattern: '*.ts' }
    const result = setupOptions(args)

    expect(result).toStrictEqual({
      pattern: '*.ts',
      mode: 'regex',
      options: {
        absolute: true,
        baseNameMatch: true,
        braceExpansion: true,
        ignore: ['**/node_modules/**'],
        cwd: '/default/output/dir'
      }
    })

    expect(findOutDirSpy).toHaveBeenCalledTimes(1)
  })

  it('should return default pattern and provided cwd', () => {
    expect.assertions(2)
    const findOutDirSpy = vi.spyOn(tsconfig, 'findOutDir')

    const args: Args = { cwd: '/custom/cwd' }
    const result = setupOptions(args)

    expect(result).toStrictEqual({
      pattern: '*.{js}',
      mode: 'regex',
      options: {
        absolute: true,
        baseNameMatch: true,
        braceExpansion: true,
        ignore: ['**/node_modules/**'],
        cwd: '/custom/cwd'
      }
    })

    expect(findOutDirSpy).not.toHaveBeenCalled()
  })

  it('should return provided pattern and cwd', () => {
    expect.assertions(2)
    const findOutDirSpy = vi.spyOn(tsconfig, 'findOutDir')

    const args: Args = { pattern: '*.ts', cwd: '/custom/cwd' }
    const result = setupOptions(args)

    expect(result).toStrictEqual({
      pattern: '*.ts',
      mode: 'regex',
      options: {
        absolute: true,
        baseNameMatch: true,
        braceExpansion: true,
        ignore: ['**/node_modules/**'],
        cwd: '/custom/cwd'
      }
    })

    expect(findOutDirSpy).not.toHaveBeenCalled()
  })

  it('should return provided mode', () => {
    expect.assertions(2)
    const findOutDirSpy = vi.spyOn(tsconfig, 'findOutDir').mockReturnValueOnce('/default/output/dir')

    const args: Args = { mode: 'ast' }
    const result = setupOptions(args)

    expect(result).toStrictEqual({
      pattern: '*.{js}',
      mode: 'ast',
      options: {
        absolute: true,
        baseNameMatch: true,
        braceExpansion: true,
        ignore: ['**/node_modules/**'],
        cwd: '/default/output/dir'
      }
    })

    expect(findOutDirSpy).toHaveBeenCalledTimes(1)
  })
})
