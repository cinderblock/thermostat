import cli from 'cli';
import {Gpio} from 'chip-gpio';
import sensor from 'ds18x20';

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

sensor.isDriverLoaded((err, isLoaded) => {
  console.log(err);
  if (!isLoaded) {
    console.log('Driver not loaded');
    return;
  }
  sensor.list((err, listOfDeviceIds) => {
    console.log(listOfDeviceIds);
  });
  setInterval(() => {
    sensor.getAll((err, tempObj) => {
      var sum = 0;
      var len = 0;
      tempObj.forEach(obj => {
        console.log(obj);
        sum += obj;
        len++;
      });

      var average = sum / len;

      console.log(average);

      setHeater(average < threshold);
    });
  }, interval);
});
