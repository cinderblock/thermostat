const sensor = require('ds18x20');
const denodeify = require('denodeify');

module.exports = {
  list: denodeify(sensor.list.bind(sensor)),
  get: denodeify(sensor.get.bind(sensor)),
  getAll: denodeify(sensor.getAll.bind(sensor)),
  isDriverLoaded: denodeify(sensor.isDriverLoaded.bind(sensor)),

  /**
   * Returns an object: {ids, temps, reduced, average}
   * ids: array of temperature sensor IDs scanned
   * temps: readings from temperature sensors
   * reduced: object containing {sum, count} of valid temperature readings
   * average: average temperature of valid temperature values
   */
  getTemperatures: async function() {
    const ids = await this.list();
    const temps = await this.get(ids);
    const reduced = temps.reduce((a, t) => {
      a = a || {sum: 0, count: 0};
      if (t !== false) {
        a.sum += t;
        a.count++;
      }
      return a;
    }, 0);

    const average = reduced.sum / reduced.count;

    return {ids, temps, reduced, average};
  },
};
