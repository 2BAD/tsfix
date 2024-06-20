import { describe, expect, it, vi } from 'vitest'
import * as tsconfig from './helpers/tsconfig.ts'
import { setupOptions } from './index.ts'
import type { Args } from './types.ts'

describe('getOptions', () => {
  it('should return default pattern and cwd when args is empty', () => {
    expect.assertions(2)
    const findOutDirSpy = vi.spyOn(tsconfig, 'findOutDir').mockReturnValueOnce('/default/output/dir')

    const args: Args = {}
    const result = setupOptions(args)

    expect(result).toStrictEqual({
      pattern: '*.{js}',
      options: {
        absolute: true,
        baseNameMatch: true,
        braceExpansion: true,
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
      options: {
        absolute: true,
        baseNameMatch: true,
        braceExpansion: true,
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
      options: {
        absolute: true,
        baseNameMatch: true,
        braceExpansion: true,
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
      options: {
        absolute: true,
        baseNameMatch: true,
        braceExpansion: true,
        cwd: '/custom/cwd'
      }
    })

    expect(findOutDirSpy).not.toHaveBeenCalled()
  })
})
