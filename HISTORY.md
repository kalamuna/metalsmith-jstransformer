# Changelog

## v0.12.0: 2017-05-25

- Update code standards

## v0.11.0: 2017-05-10

- [#25](https://github.com/RobLoach/metalsmith-jstransformer/pull/25) Remove odd file clone on rename
  - By [ycherniavsky](https://github.com/ycherniavsky)
- [#27](https://github.com/RobLoach/metalsmith-jstransformer/pull/27) Catch minimatch errors
  - By [larrybotha](https://github.com/larrybotha)

## v0.10.1: 2017-03-09

- [#22](https://github.com/RobLoach/metalsmith-jstransformer/pull/22) Delete plugin auxiliary metadata from files
  - By [ycherniavsky](https://github.com/ycherniavsky)
- [#20](https://github.com/RobLoach/metalsmith-jstransformer/pull/20) Catch and process possible exception on applying compiled layout
  - By [ycherniavsky](https://github.com/ycherniavsky)

## v0.10.0: 2016-12-16

- Added `.engineOptions` and `.engineLocals`, allowing changes to how each engine functions

## v0.9.0: 2016-12-02

- Updated dependencies

## v0.8.0: 2016-11-08

- Updated devDependencies
- Added Metalsmith's `root` to engine compilation
- Allow rendering only content matching `pattern`

## v0.7.2

- Updated dependencies

## v0.7.1

- Updated to `jstransformer@~1.0.0`
- Updated coding standards

## v0.7.0

- Updated to `async@^2.0.0-rc.5`

## v0.6.0

- Merged in and deprecated [`metalsmith-jstransformer-layouts`](https://github.com/RobLoach/metalsmith-jstransformer-layouts)

## v0.5.3

- Fixed output to be a Buffer
  - [#4](https://github.com/RobLoach/metalsmith-jstransformer/pull/4) by [@klaftertief](https://github.com/klaftertief)

## v0.5.2

- Update `minimatch` to `^3.0.0`

## v0.5.1

- Switch to minimatch for filtering files
- Update dependencies

## v0.5.0: 2015-07-11

- Added async support

## v0.4.0: 2015-07-08

- Added processing on `inputFormats` rather than using the Transformer name
- Added Transformer outputFormat support

## v0.3.0: 2015-07-06

- Rename the file on acted transformers

## v0.2.1: 2015-07-03

- Fix version targeting

## v0.2.0: 2015-07-03

- Only act on existing JSTransformers

## v0.1.0: 2015-06-25

- Recursive file extension rendering
