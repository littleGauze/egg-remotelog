'use strict';

const Client = require('./lib/client');
const RemoteTransport = require('./lib/remoteTransport');
const FileJsonTransport = require('./lib/fileJsonTransport');

module.exports = class App {
  constructor(app) {
    this.app = app;
  }

  async didReady() {
    const { file, endpoint } = this.app.config.remotelog;
    const ts = [];
    if (file) {
      const transport = new FileJsonTransport({
        level: 'INFO',
        file,
        env: this.app.config.env,
        name: this.app.name,
        json: true,
      });
      ts.push({ name: 'localELK', transport });
    }
    if (endpoint) {
      const client = new Client(this.app);
      const transport = new RemoteTransport({
        level: 'INFO',
        client,
        env: this.app.config.env,
        name: this.app.name,
        json: true,
      });
      ts.push({ name: 'remoteELK', transport });
    }
    ts.forEach(({ name, transport }) => {
      this.app.getLogger('logger').set(name, transport);
    });
  }
};
