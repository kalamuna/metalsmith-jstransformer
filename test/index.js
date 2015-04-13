var assertDir = require('assert-dir-equal')
var jstransformer = require('../')
var Metalsmith = require('metalsmith')

describe('metalsmith-jstransformer', function () {
  it('should process index.html.jade', function (done) {
    Metalsmith('test/fixtures/basic')
      .use(jstransformer([
        'jade'
      ]))
      .build(function(err) {
        if (err) return done(err)
        assertDir('test/fixtures/basic/expected', 'test/fixtures/basic/build')
        return done(null)
      })
  })
})