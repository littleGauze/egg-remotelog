'use strict';
const FileBufferTransport = require('egg-logger').FileBufferTransport;

module.exports = class RemoteTransport extends FileBufferTransport {
  /**
   * @class
   * @param {Object} options
   * - {string} env - env config
   */
  constructor(options) {
    super(options);
    this._env = options.env;
    this._name = options.name;
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
    return super.log(level, args, {
      ...meta,
      'service.name': `${this._env}-${this._name}`,
      'log.level': level,
      '@timestamp': new Date(),
      traceid: match ? match[1] : '',
      message,
    });
  }
};
