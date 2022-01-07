'use strict';

const mock = require('egg-mock');

describe('test/remotelog.test.js', () => {
  let app;
  before(() => {
    app = mock.app({
      baseDir: 'apps/remotelog-test',
    });
    return app.ready();
  });

  after(() => app.close());
  afterEach(mock.restore);

  it('should GET /', () => {
    return app.httpRequest()
      .get('/')
      .expect('hi, remotelog')
      .expect(200);
  });
});
