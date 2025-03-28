# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Breaking Changes

### Added

- **Path alias resolution** for TypeScript path mappings defined in tsconfig.json
  - Automatically transforms imports using path aliases to proper relative paths with extensions
  - Works with any path mapping configuration in your tsconfig.json
  - Supports nested aliases with correct resolution of the longest matching pattern

### Fixed

- Improved handling of directory imports to properly resolve to index.js files
- Better error handling when files can't be found or accessed

### Changed

- More accurate detection of quote types (single vs double) when transforming imports
- Enhanced error messages for better debugging of transformation issues

### Removed

## [1.0.0] - 2025-03-04

### Added

- **AST-based import extraction** using TypeScript's compiler API
  - More accurate parsing of complex TypeScript syntax
  - Better handling of edge cases and unusual formatting
- **Integration tests** with real-world codebases

### Changed

- Updated CLI to support specifying extraction mode (`--mode ast` or `--mode regex`)
- Default mode remains regex-based for backward compatibility
- Replaced Prettier with Biome
- Refactored integration tests to use CLI
- Improved integration tests by using beforeAll/afterAll hooks and parallel test environments

### Fixed

- Fixed CJS module import issues with glob package
- Resolved TypeScript mocking in tsconfig tests
- Various import path corrections

### Dependencies

- Added `execa` package for process execution
- Added types for `debug` package
- Updated dependencies to latest versions
