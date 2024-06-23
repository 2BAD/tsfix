import meow from 'meow'
import { afterEach, describe, expect, it, vi } from 'vitest'
// @ts-expect-error its mocked anyway
import { tsFix } from '../build/tsfix.js'

vi.mock('meow')
vi.mock('../build/tsfix.js', () => ({
  tsFix: vi.fn()
}))

describe('cli', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should call tsFix with provided options when arguments are provided', async () => {
    expect.assertions(1)
    const mockFlags = { extensions: 'jsx,tsx', pattern: '*.js' }
    const mockInput: string[] = ['./dist']
    // @ts-expect-error no need to mock all returned properties
    vi.mocked(meow).mockReturnValue({ flags: mockFlags, input: mockInput })

    // @ts-expect-error this module doesn't export anything
    await import('../bin/cli.mjs')

    expect(tsFix).toHaveBeenCalledWith({ cwd: './dist', extensions: 'jsx,tsx', pattern: '*.js' })
  })
})
