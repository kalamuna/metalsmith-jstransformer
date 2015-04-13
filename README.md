# Metalsmith JSTransformer Plugin

[![Build Status](https://img.shields.io/travis/RobLoach/metalsmith-jstransformer/master.svg)](https://travis-ci.org/RobLoach/metalsmith-jstransformer)
[![Dependency Status](https://david-dm.org/RobLoach/metalsmith-jstransformer.png)](https://david-dm.org/RobLoach/metalsmith-jstransformer)
[![NPM version](https://img.shields.io/npm/v/metalsmith-jstransformer.svg)](https://www.npmjs.org/package/metalsmith-jstransformer)

[Metalsmith](http://metalsmith.io) plugin to process files with [JSTransformer](https://github.com/jstransformers/jstransformer), using [any available transformer](https://www.npmjs.com/browse/keyword/jstransformer).

## Installation

    npm install --save metalsmith-jstransformer

## Usage

If you haven't checked out [Metalsmith](http://metalsmith.io) before, head over
to their website and check out the documentation.

### CLI

If you are using the command-line version of Metalsmith, you can install via npm, and then add the
`metalsmith-jstransformer` key to your `metalsmith.json` file:

```json
{
  "plugins": {
    "metalsmith-jstransformer": [
      "jade"
    ]
  }
}
```

### JavaScript

If you are using the JS Api for Metalsmith, then you can require the module and add it to your
`.use()` directives:

```js
var jstransformer = require('metalsmith-jstransformer');

metalsmith.use(jstransformer([
  'jade'
]));
```

## Options

An array of strings representing which JSTransformers to use. Example:

```javascript
['jade', 'scss']
```
