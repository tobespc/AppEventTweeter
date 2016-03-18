/**
 * AppEventTweeter
 */
var appmetrics = require('appmetrics');
var monitor = appmetrics.monitor();
var Twitter = require('twitter');
var gcMetrics = {
  used : 0,
  count : 0
};

var client = new Twitter({
  consumer_key : process.env.TWITTER_CONSUMER_KEY,
  consumer_secret : process.env.TWITTER_CONSUMER_SECRET,
  access_token_key : process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret : process.env.TWITTER_ACCESS_TOKEN_SECRET
});

function tweetMessage(message) {
  client.post('statuses/update', {
    status : message
  }, function(error, tweet, response) {
    if (!error) {
//      console.log(tweet);
    }
  });
}

// When we get a gc event, update our metrics
monitor.on('gc', function(data) {
  gcMetrics.used += data.used;
  gcMetrics.count++;
});

function getGCHeapData() {
  if (gcMetrics.count > 0) {
    var usedHeap = gcMetrics.used / gcMetrics.count;

    // Reset values
    gcMetrics.used = 0;
    gcMetrics.count = 0;
  } else {
    usedHeap = -1;
  }
  return usedHeap;
}

var interval;
var usedHeapOld = -1;
var timingInterval = 10000; // 10 seconds
var detectionCount = 0;

start();

function start() {
  interval = setInterval(
      function() {
        var usedHeap = getGCHeapData();
        // check we have a usedHeap average
        if (usedHeap != -1) {
          // if usedHeapOld is still unset, update to new value
          if (usedHeapOld == -1) {
            usedHeapOld = usedHeap;
          } else {
            // has used heap increased
            if (usedHeap > usedHeapOld) {
              detectionCount++;
              // Once we have hit this 5 times in a row, tell someone
              if (detectionCount > 5) {
                tweetMessage("Average heap use is increasing. Currently at "
                    + Number((usedHeap / (1024 * 1024)).toFixed(3)) + "MB");
                detectionCount = 0;
              }
            } else if (usedHeap < usedHeapOld) {
              // if its decreasing reset counter
              detectionCount = 0;
            }
            usedHeapOld = usedHeap;
          }
        }
      }, timingInterval).unref();
}

function stop() {
  clearInterval(interval);
}
