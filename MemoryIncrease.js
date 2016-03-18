/*
 * MemoryIncrease.js
 */

require('./AppEventTweeter');
var timingInterval = 1; // 1 seconds
var memoryArray=[];
var iteration=0;


startIncrease();

function startIncrease() {
  interval = setInterval(
      function() {
        iteration += 100;
        var x={y:99999999999999999999999999999 + iteration};
        var x1={y:99999999999999999999999999999 + iteration};
        var x2={y:99999999999999999999999999999 + iteration};
        var x3={y:99999999999999999999999999999 + iteration};
        var x4={y:99999999999999999999999999999 + iteration};
        var x5={a:x,b:x1,c:x2,d:x3,e:x4}
        memoryArray.push(x5);
        global.gc();
      }, timingInterval);
}
