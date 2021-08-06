const R = require('ramda');
const keys = require('../../config/keys');

function log({ printTime, startTime, level }, message) {
   if (level > keys.loggingLevel) {
      return;
   }
   const timeNow = new Date();
   const timeElapsed = startTime ? 'It took ' + ((timeNow - startTime) / 1000) + ' seconds' : null;
   const printableTime = printTime ? 'Happened at ' + timeNow.toGMTString() : null;
   
   const messages = R.pipe(
      R.slice(1, Infinity),
      msgArr => printTime ? R.append(printableTime, msgArr) : msgArr,
      msgArr => timeElapsed ? R.append(timeElapsed, msgArr) : msgArr,
   )([...arguments]);
   
   console.log(...messages);
   return timeNow.getTime();
}

module.exports = { log }; 
