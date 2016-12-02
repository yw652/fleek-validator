'use strict';

for (let fileName of require('fs').readdirSync(__dirname)) {
  if (fileName !== 'index.js' && /\.js$/.test(fileName)) {
    let bucket = require(`./${fileName}`);
    for (let prop of Object.keys(bucket || {})) module.exports[prop] = bucket[prop];
  }
}
