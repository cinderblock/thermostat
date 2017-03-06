const cli = require('cli');
const Gpio = require('chip-gpio').Gpio;
const sensor = require('./ds18x20-async.js');
const express = require('express');
const Program = require('./Program.js');

const app = express();

// CLI options
var options = cli.parse();

// Interval for checking/updating temperature
var interval = 2000;

// Threshold temperature for turning the heater on
var threshold = new Program(21.3);

// Hysteresis on threshold
// When heater is on, threshold is increased by half of this amount.
// When heater is off, threshold is reduced by half this amount.
var hysteresis = .1;

// Most recent temperature reading
var temperature = false;

/**
 * Extract just the time component, in local timezone, in 24-hour format, from a Date
 */
function getTime(date) {
  return (new Date(date)).toLocaleTimeString('en-US', {hour12: false});
}

var nightEnd = '07:30:00';
var nightStart = '21:00:00';
var nightThreshold = 17;

/**
 * Threshold function for thermostat program
 * If not night, return undefined
 */
function nightThreshold() {
  var time = getTime();
  if (time < nightEnd || time > nightStart) {
    return nightThreshold;
  }
}

/**
 * Simple HTTP endpoint for setting a new temperature value
 */
app.get('/:temp?', (req, res) => {
  // Make sure `temperature` is a string before `send()` uses it
  res.send('' + temperature);
  // Parse target temperature
  var temp = parseFloat(req.params.temp);
  // praseFloat returns NaN if string was not parseable
  if (isNaN(temp)) return;
  // Update default threshold
  console.log('Threshold set:', threshold.setDefaultThreshold(temp));
});

// Listen on port 80. We're assuming we're run as root, for now.
app.listen(80);

// String used to idicate degreeC units
const degC = '\u00B0C';

// Gpio to control heater output
var heater = new Gpio(0, 'out');

/**
 * Read the current heater output state.
 *
 * @return true iff heater is on
 */
function getHeater() {
  return heater.read() == 0;
}

/**
 * Set heater output to some state. true means on.
 *
 * Does nothing if heater is already in the correct state.
 */
function setHeater(on) {
  if (getHeater() == on) return;
  console.log('Heater:', on ? 'on' : 'off');
  heater.write(on ? 0 : 1);
}

/**
 * Simple utility function that returns the negative of a value if the second argument is true-ish
 */
function negateIf(num, neg) {
  return neg ? -num : num;
}

/**
 * workhorse function.
 *
 * This is the guts of how we decide if the heater should be on or not.
 */
async function doThermostat() {
  var temps = await sensor.getTemperatures();

  // Just in case no temperature sensors are available
  if (temps.reduced.count == 0) {
    console.log('No temperatures read');
    return;
  }

  // Print valid temperature readings. Record average temperature
  console.log(temperature = temps.average, degC, temps.temps.map(t => t === false ? t : t + ' ' + degC));

  // Set the output to the desired state
  setHeater(temps.average < threshold.getCurrentThreshold() - negateIf(hysteresis / 2, getHeater()));
}

/**
 * program entry point.
 *
 * Starts an interval that the 'doThermostat' function is called from.
 */
(async function main() {
  // Just in case, check if kernel driver is loaded.
  var isLoaded = await sensor.isDriverLoaded();
  if (!isLoaded) {
    console.log('Driver not loaded');
    return;
  }

  // During startup, get the list of temperature devices currently plugged in.
  // This value is not used later.
  // Every interval it scans for all available temperature sensors.
  var listOfDeviceIds = await sensor.list();

  // Print found temperature sensors
  console.log('Found devices:');
  console.log(listOfDeviceIds);

  // Keep track of the number of running instances of this interval
  var running = 0;

  setInterval(async () => {
    // If this interval is already running somehow, don't start another.
    if (running > 0) return;
    running++;
    await doThermostat();
    running--;
  }, interval);
})();
