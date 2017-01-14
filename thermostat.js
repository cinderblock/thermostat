const cli = require('cli');
const Gpio = require('chip-gpio').Gpio;
const sensor = require('./ds18x20-async.js');

var options = cli.parse();

var interval = 2000;
var threshold = 25;
var hysteresis = .1;

const degC = '\u00B0C';

var heater = new Gpio(0, 'out');

function getHeater() {
  return heater.read() == 0;
}

function setHeater(on) {
  if (getHeater() == on) return;
  console.log('Heater:', on ? 'on' : 'off');
  heater.write(on ? 0 : 1);
}

function negateIf(num, neg) {
  return neg ? -num : num;
}

async function doThermostat() {
  var temps = await sensor.getTemperatures();

  if (temps.reduced.count == 0) {
    console.log('No temperatures read');
    return;
  }

  console.log(temps.average, degC, temps.temps.map(t => t === false ? t : t + ' ' + degC));

  setHeater(temps.average < threshold - negateIf(hysteresis / 2, getHeater()));
}

(async function main() {
  var isLoaded = await sensor.isDriverLoaded();
  if (!isLoaded) {
    console.log('Driver not loaded');
    return;
  }

  var listOfDeviceIds = await sensor.list();

  console.log('Found devices:');
  console.log(listOfDeviceIds);

  setInterval(async () => {
    await doThermostat();
  }, interval);
})();
