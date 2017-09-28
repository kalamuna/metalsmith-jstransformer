# Metalsmith JSTransformer Plugin [![NPM version](https://img.shields.io/npm/v/metalsmith-jstransformer.svg)](https://www.npmjs.org/package/metalsmith-jstransformer)

[![Build Status](https://img.shields.io/travis/RobLoach/metalsmith-jstransformer/master.svg)](https://travis-ci.org/RobLoach/metalsmith-jstransformer)
[![Dependency Status](https://david-dm.org/RobLoach/metalsmith-jstransformer.png)](https://david-dm.org/RobLoach/metalsmith-jstransformer)
[![Greenkeeper badge](https://badges.greenkeeper.io/RobLoach/metalsmith-jstransformer.svg)](https://greenkeeper.io/)

[Metalsmith](http://metalsmith.io) plugin to process files with any [JSTransformer](http://github.com/jstransformers).

## Installation

    npm install --save metalsmith-jstransformer

### CLI

If you are using the command-line version of Metalsmith, you can install via npm, and then add the `metalsmith-jstransformer` key to your `metalsmith.json` file:

```json
{
  "plugins": {
    "metalsmith-jstransformer": {
      "layoutPattern": "layouts/**",
      "defaultLayout": null
    }
  }
}
```

### JavaScript

If you are using the JS Api for Metalsmith, then you can require the module and add it to your `.use()` directives:

```js
var jstransformer = require('metalsmith-jstransformer');

metalsmith.use(jstransformer({
  'pattern': '**',
  'layoutPattern': 'layouts/**',
  'defaultLayout': null
}));
```

## Convention

### Content File Names

Create files that you would like to act on with JSTransformers with file extensions representing the transformer to use, in the format `example.html.<transformer>`. For example, if you would like to process with Pug, you would name it `src/example.html.pug`.

Use multiple transformers by appending additional file extension transformer names at the end. For example, to [HTML-Minifier](https://github.com/jstransformers/jstransformer-html-minifier) our Pug example above, you would use the filename `src/example.html.html-minifier.pug`.

#### Example

The following example uses [Pug](https://pugjs.org/), so we must additionally install [`jstransformer-pug`](http://npm.im/jstransformer-pug):

    npm install jstransformer-pug --save

##### `src/example.html.pug`

```
---
pageTitle: My Site
pretty: true
---
doctype html
html(lang="en")
  head
    title= pageTitle
  body
    p This is my site!
```

##### Result

``` html
<!doctype html>
<html>
  <head>
    <title>My Site</title>
  </head>
  <body>
    <p>This is my site!</p>
  </body>
</html>
```

### Layouts

Declare layouts for your content with the extension of the template engine to be used for the layout, in the `src/layouts/**` directory.

#### Example

The following example uses [Pug](https://pugjs.org) and [Markdown-it](https://www.npmjs.com/package/markdown-it), so we must additionally install [`jstransformer-pug`](http://npm.im/jstransformer-pug) and [`jstransformer-markdown-it`](https://www.npmjs.com/package/jstransformer-markdown-it):

    npm install jstransformer-pug --save
    npm install jstransformer-markdown-it --save

##### `src/layouts/default.pug`

``` pug
---
pretty: true
---
doctype html
html
  head
    title My Site
  body!= contents
```

Within the metadata of content in your `src` directory, tell it which layout to use:

##### `src/index.md`

``` yaml
---
layout: layouts/default.pug
---
This is my **site**!
```

#### Result
``` html
<!doctype html>
<html>
  <head>
    <title>My Site</title>
  </head>
  <body>
    <p>This is my <strong>site</strong>!</p>
  </body>
</html>
```

## Configuration

### `.pattern`

Render content only matching the given [minimatch](https://www.npmjs.com/package/minimatch) pattern. Defaults to `**`.

### `.layoutPattern`

The pattern used to find your layouts, from within the Metalsmith source directory. Defaults to `layouts/**`.

### `.defaultLayout`

If provided, will be used as the default layout for content that doesn't have a layout explicitly defined. Needs to be the full path to the file, from the Metalsmith source directory. Defaults to `null`.

### `.engineOptions`

Allows passing in options for the given engines.

``` js
engineOptions: {
  // Add our own SASS include paths.
  scss: {
    includePaths: [
      'styles/mystyles',
      'node_modules/bootstrap'
    ]
  }
}
```

### `.engineLocals`

Allows passing in local variables for the given engines.

``` js
engineLocals: {
  // All Twig templates will have the `baseURL` local variable.
  twig: {
    baseURL: 'http://mywebsite.com/'
  }
}
```

## License

MIT
