'use strict';

module.exports = class Client {
  constructor(app) {
    this.app = app;
  }

  get name() {
    return this.app.name;
  }

  get env() {
    console.log('app.config.log', this.app.config.logger);
    return this.app.config.env;
  }

  async sendLogs(logs) {
    const { endpoint } = this.app.config.remotelog;
    logs = `[${logs.slice(0, -1)}]`;
    const params = {
      timeout: 30000,
      method: 'POST',
      contentType: 'json',
      dataType: 'json',
      data: logs,
    };
    console.log(endpoint, params);
    // const ret = await this.app.curl(endpoint, params).catch(console.error);
    // return ret;
  }
};
