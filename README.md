# TSFIX

[![NPM version](https://img.shields.io/npm/v/@2bad/tsfix)](https://www.npmjs.com/package/@2bad/tsfix)
[![License](https://img.shields.io/npm/l/@2bad/tsfix)](https://www.npmjs.com/package/@2bad/tsfix)
[![GitHub Build Status](https://img.shields.io/github/actions/workflow/status/2BAD/tsfix/build.yml)](https://github.com/2BAD/tsfix/actions/workflows/build.yml)
[![Code coverage](https://img.shields.io/codecov/c/github/2BAD/tsfix)](https://codecov.io/gh/2BAD/tsfix)
[![Written in TypeScript](https://img.shields.io/github/languages/top/2BAD/tsfix)](https://github.com/2BAD/tsfix/search?l=typescript)

A post-compilation tool that fixes TypeScript's critical ESM compatibility failures. Properly adds .js extensions, resolves path aliases, and handles index.js imports where tsc consistently falls short, even in the latest versions.

## Complete Solution for All TypeScript Issues

- ✅ **Fixes Extension Problems**: Adds required `.js` extensions to imports
- ✅ **Handles Directory Imports**: Properly resolves to `index.js` files
- ✅ **Transforms Path Aliases**: Converts tsconfig aliases to valid relative paths
- ✅ **Fixes Declaration Files**: Properly handles `.d.ts` files (unlike TypeScript itself)
- ✅ **Zero Configuration**: Works out-of-the-box with any TypeScript setup
- ✅ **Universal Compatibility**: Works with all TypeScript versions and config setups
- ✅ **High Performance**: Offers both fast regex mode and accurate AST mode

## Zero Hassle Setup

```shell
npm install --save-dev @2bad/tsfix
```

Then add `postbuild` script to your package.json:

```json
{
  "scripts": {
    "build": "tsc",
    "postbuild": "tsfix"
  }
}
```

That's it. TSFIX finds your TypeScript output and fixes all import issues automatically.

## Real World Examples

### Converting Regular Imports

```typescript
// Before TypeScript Compilation
import { helper } from './utils/helper.ts'

// After TypeScript Compilation (BROKEN)
import { helper } from './utils/helper.ts'

// After TSFIX (FIXED)
import { helper } from './utils/helper.js' // Works in ESM!
```

### Fixing Path Alias Imports

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}

// Before TypeScript Compilation
import { Button } from '@/components/Button'

// After TypeScript Compilation (BROKEN)
import { Button } from '@/components/Button'

// After TSFIX (FIXED)
import { Button } from './src/components/Button.js' // Correctly resolved!
```

### Resolving Directory Imports

```typescript
// Before TypeScript Compilation
import { config } from './config'

// After TypeScript Compilation (BROKEN)
import { config } from './config'

// After TSFIX (FIXED)
import { config } from './config/index.js' // Properly resolved!
```

## Advanced Usage

```sh
# Use AST-based extraction (more accurate but slower)
npx @2bad/tsfix --mode ast

# Custom file matching pattern
npx @2bad/tsfix --pattern "**/*.js"
```

## Debugging

Enable detailed logging:

```sh
# Enable all debug logging
DEBUG=* tsfix

# Only enable specific components
DEBUG=tsfix:main,tsfix:extractor tsfix

# Show only fixer operations
DEBUG=tsfix:fixer tsfix
```

## Why TSFIX exists

### Major TypeScript Issues (Still Unresolved)
- [#16577](https://github.com/microsoft/TypeScript/issues/16577): Provide a way to add the '.js' file extension to the end of module specifiers (2017)
- [#28288](https://github.com/microsoft/TypeScript/issues/28288): Feature: disable extensionless imports (2018)
- [#40878](https://github.com/microsoft/TypeScript/issues/40878): Compiled JavaScript import is missing file extension (2020)
- [#42151](https://github.com/microsoft/TypeScript/issues/42151): TypeScript cannot emit valid ES modules due to file extension issue (2020)
- [#50501](https://github.com/microsoft/TypeScript/issues/50501): TypeScript is not an ECMAScript superset post-ES2015 (2022)
- [#61037](https://github.com/microsoft/TypeScript/issues/61037): `rewriteRelativeImportExtensions` doesn't rewrite extensions in emitted declaration files (2025)
- [#61213](https://github.com/microsoft/TypeScript/issues/61213): Allow allowImportingTsExtensions: without either '--noEmit' or '--emitDeclarationOnly' (2025)

### Previously Addressed (Partially)

- [#49083](https://github.com/microsoft/TypeScript/issues/49083): "module": "node16" should support extension rewriting (Partially addressed via [#59767](https://github.com/microsoft/TypeScript/pull/59767))


## Performance Options

TSFIX offers two extraction engines:

- **Regex mode** (default): Fast pattern-based extraction (5x faster than AST mode)
- **AST mode**: Precise syntax tree-based extraction for complex codebases

## Contributing

Contributions welcome! Open issues for bugs/features or submit PRs with improvements.
