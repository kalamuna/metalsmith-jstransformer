# Metalsmith JSTransformer Plugin [![NPM version](https://img.shields.io/npm/v/metalsmith-jstransformer.svg)](https://www.npmjs.org/package/metalsmith-jstransformer)

[![Build Status](https://img.shields.io/travis/RobLoach/metalsmith-jstransformer/master.svg)](https://travis-ci.org/RobLoach/metalsmith-jstransformer)
[![Dependency Status](https://david-dm.org/RobLoach/metalsmith-jstransformer.png)](https://david-dm.org/RobLoach/metalsmith-jstransformer)

[Metalsmith](http://metalsmith.io) plugin to process files with any [JSTransformer](http://github.com/jstransformers).

## Installation

    npm install --save metalsmith-jstransformer

## Usage

Create files that you would like to act on with JSTransformers with file extensions representing the transformer to use, in the format `example.html.<transformer>`. For example, if you would like to process with Jade, you would name it `example.html.jade`.

Use multiple transformers by appending additional file extension transformer names at the end. For example, to [HTML-Minifier](https://github.com/jstransformers/jstransformer-html-minifier) our Jade example above, you would use the filename `example.html.html-minifier.jade`.

```
example.html.html-minifier.jade
example.html.html-minifier
example.html
```

Jade -> HTML-Minifier -> example.html

### CLI

If you are using the command-line version of Metalsmith, you can install via npm, and then add the `metalsmith-jstransformer` key to your `metalsmith.json` file:

```json
{
  "plugins": {
    "metalsmith-jstransformer": {}
  }
}
```

### JavaScript

If you are using the JS Api for Metalsmith, then you can require the module and add it to your `.use()` directives:

```js
var jstransformer = require('metalsmith-jstransformer');

metalsmith.use(jstransformer());
```

## License

MIT
