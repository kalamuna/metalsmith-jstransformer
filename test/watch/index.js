/* eslint-env node,es6 */
const Metalsmith = require('metalsmith');
const jstransformer = require('../..');
const watch = require('metalsmith-watch');

Metalsmith(__dirname)
  .source(__dirname)
  .clean(true)
  // Gists don't support directories, so we have to stuff everything here :/
  .ignore('.git')
  .ignore('.gitignore')
  .ignore('README.md')
  .ignore('build')
  .ignore('index.js')
  .ignore('node_modules')
  .ignore('package.json')
  .ignore('yarn.lock')
  .use(
    jstransformer({
      layoutPattern: '**/*.pug',
      pattern: '**/*',
    })
  )
  .use(watch({paths: {'index.html': true, 'index.pug': 'index.html'}}))
  .build(err => {
    if (err) {
      throw err;
    }
    process.stdout.write('Build complete\n');
  });
