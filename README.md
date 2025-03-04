# TSFIX - TypeScript to ESM Made Simple

[![NPM version](https://img.shields.io/npm/v/@2bad/tsfix)](https://www.npmjs.com/package/@2bad/tsfix)
[![License](https://img.shields.io/npm/l/@2bad/tsfix)](https://www.npmjs.com/package/@2bad/tsfix)
[![GitHub Build Status](https://img.shields.io/github/actions/workflow/status/2BAD/tsfix/build.yml)](https://github.com/2BAD/tsfix/actions/workflows/build.yml)
[![Code coverage](https://img.shields.io/codecov/c/github/2BAD/tsfix)](https://codecov.io/gh/2BAD/tsfix)
[![Written in TypeScript](https://img.shields.io/github/languages/top/2BAD/tsfix)](https://github.com/2BAD/tsfix/search?l=typescript)

TSFIX fixes ESM compatibility in tsc-compiled JavaScript by adding required file extensions to imports. ESM demands explicit file extensions that the TypeScript compiler doesn't provide automatically.

## Features

- Auto-detects TypeScript config and output paths
- Handles all import types (absolute, relative, dynamic)
- Offers regex (fast) and AST (accurate) extraction modes
- Adds `.js` extensions to compiled JS imports specifiers
- Resolves directory imports to `index.js`
- Handles `.ts` extensions when `allowImportingTsExtensions` is enabled
- Fixes `.d.ts` files (unlike TypeScript's `--rewriteRelativeImportExtensions`)
- Compatible with all TypeScript versions

## Install

```shell
npm install --save-dev @2bad/tsfix
```

## Usage

### As a post-build script

Add `tsfix` as a post-build script in your project's package.json:

```json
{
  "scripts": {
    "build": "tsc",
    "postbuild": "tsfix"
  }
}
```

This automatically runs `tsfix` after TypeScript compilation.

### Manual execution

```sh
npx @2bad/tsfix
```

### Advanced options

```sh
# Use AST-based extraction (more accurate but slower)
npx @2bad/tsfix --mode ast

# Custom file matching pattern
npx @2bad/tsfix --pattern "**/*.js"
```

## Example

Consider the following TypeScript files:

```typescript
// src/main.ts
import { helper } from './utils/helper.ts'

// src/utils/helper.ts
export const helper = () => 'helper function'
```

After running tsc, the compiled JavaScript files might look like this:

```javascript
// dist/main.js
import { helper } from './utils/helper.ts'

// dist/utils/helper.js
export const helper = () => 'helper function'
```

Running tsfix will transform the import paths to:

```javascript
// dist/main.js
import { helper } from './utils/helper.js'
```

## Troubleshooting

Use the `DEBUG` environment variable to enable detailed logging:

```sh
# Enable all debug logging
DEBUG=* tsfix

# Only enable specific components
DEBUG=tsfix:main,tsfix:extractor tsfix

# Show only fixer operations
DEBUG=tsfix:fixer tsfix
```

## Why TSFIX exists

TypeScript still lacks proper ESM output support after 8+ years of requests. The recent `--rewriteRelativeImportExtensions` flag in TS 5.5+ has limitations with .d.ts files. TSFIX resolves these issues, saving development time.

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


### ESM Requirements

ESM has stricter requirements than CommonJS:

- Required file extensions (`.js`, `.mjs`)
- No automatic `index.js` resolution
- No directory-to-file resolution
- Different package.json 'exports' handling

## Performance

TSFIX offers two extraction engines:

- **Regex mode** (default): Fast pattern-based extraction (x5 faster than AST mode)
- **AST mode**: Precise syntax tree-based extraction

## Contributing

Contributions welcome! Open issues for bugs/features or submit PRs with improvements.
