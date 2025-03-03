import meow from 'meow'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { tsFix } from '../build/tsfix.js'

vi.mock('meow')
vi.mock('../build/tsfix.js', () => ({
  tsFix: vi.fn()
}))

describe('cli', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should call tsFix with correct options', async () => {
    expect.assertions(1)

    const mockFlags = { extensions: 'jsx,tsx', pattern: '*.js', mode: 'regex' }
    const mockInput: string[] = ['./dist']
    // @ts-expect-error no need to mock all returned properties
    vi.mocked(meow).mockReturnValue({ flags: mockFlags, input: mockInput })

    try {
      // @ts-expect-error this module doesn't export anything
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _cliModule = await import('../bin/cli.mjs')
    } finally {
      expect(tsFix).toHaveBeenCalledWith({ cwd: './dist', extensions: 'jsx,tsx', pattern: '*.js', mode: 'regex' })
    }
  })
})
