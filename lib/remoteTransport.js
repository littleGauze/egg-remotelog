'use strict';
const Transport = require('egg-logger').Transport;

module.exports = class RemoteTransport extends Transport {
  /**
   * @class
   * @param {Object} options
   * - {Client} client - remote client
   * - {Number} [flushInterval = 1000] - interval for flush to file
   * - {Number} [maxBufferLength = 1000] - max buffer queue length
   * - {String} [level = INFO] - log level
   */
  constructor(options) {
    super(options);

    this._client = options.client;
    this._bufSize = 0;
    this._buf = [];
    this._timer = this._createInterval();
  }

  get serviceEnv() {
    return this._client.env;
  }

  get serviceName() {
    return this._client.name;
  }

  get defaults() {
    return Object.assign(super.defaults, {
      flushInterval: 1000,
      maxBufferLength: 1000,
    });
  }

  /**
   * close stream and interval
   */
  close() {
    this._closeInterval();
    super.close();
  }

  /**
   * @deprecated
   */
  end() {
    this.close();
  }

  /**
   * flush log into file
   */
  flush() {
    if (this._buf.length > 0) {
      this._client.sendLogs(this._buf.join(''));
      this._buf = [];
      this._bufSize = 0;
    }
  }

  /**
   * Transport log method
   * @param  {String} level - log level
   * @param  {Array} args - all methods
   * @param  {Object} meta - meta infomations
   */
  log(level, args, meta) {
    const { message, paddingMessage } = meta;
    const reg = /\/([\w-]{32,})\//;
    const match = paddingMessage.match(reg);
    const logs = {
      'service.name': `${this.serviceEnv}-${this.serviceName}`,
      'log.level': level,
      '@timestamp': new Date(),
      traceid: match ? match[1] : '',
      message,
    };
    this._write(Buffer.from(JSON.stringify(logs)) + ',');
  }

  /**
   * override, save in memory temporary
   * @param {Buffer} buf - log buffer
   * @private
   */
  _write(buf) {
    this._bufSize += buf.length;
    this._buf.push(buf);
    if (this._buf.length > this.options.maxBufferLength) {
      this.flush();
    }
  }

  /**
   * create interval to flush log into file
   * @return {Interval} 定时器
   * @private
   */
  _createInterval() {
    return setInterval(() => this.flush(), this.options.flushInterval);
  }

  /**
   * close interval
   * @private
   */
  _closeInterval() {
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
  }
};
