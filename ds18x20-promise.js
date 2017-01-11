const sensor = require('ds18x20');
const denodeify = require('denodeify');

module.exports = {
  list: denodeify(sensor.list.bind(sensor)),
  get: denodeify(sensor.get.bind(sensor)),
  getAll: denodeify(sensor.getAll.bind(sensor)),
  isDriverLoaded: denodeify(sensor.isDriverLoaded.bind(sensor)),
};
