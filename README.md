# TSFIX

> **Deprecated**: this project is no longer maintained. Use [tsdown](https://tsdown.dev/) instead. It handles ESM output, `.d.ts` generation, path alias resolution, and package validation in a single build step, making post-compilation fixers like tsfix unnecessary. See [Migrate to tsdown](#migrate-to-tsdown) below.

[![NPM version](https://img.shields.io/npm/v/@2bad/tsfix)](https://www.npmjs.com/package/@2bad/tsfix)
[![License](https://img.shields.io/npm/l/@2bad/tsfix)](https://www.npmjs.com/package/@2bad/tsfix)

A post-compilation tool that fixes TypeScript's critical ESM compatibility failures. Properly adds .js extensions, resolves path aliases, and handles index.js imports where tsc consistently falls short, even in the latest versions.

## Migrate to tsdown

[tsdown](https://tsdown.dev/) (powered by Rolldown + oxc) handles ESM output, `.d.ts` generation, path alias resolution, and package validation in a single build step, making post-compilation fixers like tsfix unnecessary. It replaces your entire build pipeline with one command.

See the [tsdown documentation](https://tsdown.dev/) for setup instructions, or [2BAD/ts-lib-starter](https://github.com/2BAD/ts-lib-starter) for a working example.

## Why TSFIX existed

### Major TypeScript Issues (Still Unresolved)
- [#16577](https://github.com/microsoft/TypeScript/issues/16577): Provide a way to add the '.js' file extension to the end of module specifiers (2017)
- [#28288](https://github.com/microsoft/TypeScript/issues/28288): Feature: disable extensionless imports (2018)
- [#40878](https://github.com/microsoft/TypeScript/issues/40878): Compiled JavaScript import is missing file extension (2020)
- [#42151](https://github.com/microsoft/TypeScript/issues/42151): TypeScript cannot emit valid ES modules due to file extension issue (2020)
- [#50501](https://github.com/microsoft/TypeScript/issues/50501): TypeScript is not an ECMAScript superset post-ES2015 (2022)
- [#61037](https://github.com/microsoft/TypeScript/issues/61037): `rewriteRelativeImportExtensions` doesn't rewrite extensions in emitted declaration files (2025)
- [#61213](https://github.com/microsoft/TypeScript/issues/61213): Allow allowImportingTsExtensions without either '--noEmit' or '--emitDeclarationOnly' (2025)

### Previously Addressed (Partially)

- [#49083](https://github.com/microsoft/TypeScript/issues/49083): "module": "node16" should support extension rewriting (Partially addressed via [#59767](https://github.com/microsoft/TypeScript/pull/59767))

## License

MIT
