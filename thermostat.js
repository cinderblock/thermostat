const cli = require('cli');
const Gpio = require('chip-gpio').Gpio;
const sensor = require('ds18x20');
const denodeify = require('denodeify');

var options = cli.parse();

var interval = 2000;
var threshold = 25;

var heater = new Gpio(0, 'out');

function setHeater(on) {
  console.log('Heater:', on ? 'on' : 'off');
  heater.write(on ? 0 : 1);
}
function setHeaterOn() {
  setHeater(true);
}
function setHeaterOff() {
  setHeater(false);
}

var listSensors = denodeify(sensor.list.bind(sensor));

async function getTemperatures() {

  return new Promise((sensor.list((err, idList) => {
    if (err) {
      return callback(err);
    }
    that.get(idList, (err, result) => {
    });
  });


  sensor.getAll((err, tempObj) => {
    var sum = 0;
    var len = 0;

    for (var obj in tempObj) {
      console.log(tempObj[obj]);
      sum += tempObj[obj];
      len++;
    }

    var average = sum / len;

    console.log(average);

    setHeater(average < threshold);
  });
}

sensor.isDriverLoaded((err, isLoaded) => {
  console.log(err);
  if (!isLoaded) {
    console.log('Driver not loaded');
    return;
  }
  sensor.list((err, listOfDeviceIds) => {
    console.log('Found devices:');
    console.log(listOfDeviceIds);
  });
  setInterval(() => {
    ;
  }, interval);
});
