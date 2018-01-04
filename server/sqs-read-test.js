var AWS = require('aws-sdk');
// AWS.config.update({region:'us-west-1'});
// AWS.config.update({accessKeyId: "AKIAIQ3QZKRFTJZ3ONSA",
//   secretAccessKey: "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", region: 'us-west-2'});
// Set the region 

// Create an SQS service object
AWS.config.loadFromPath(__dirname + '/../awsConfig.json');
// AWS.config.update({region: 'us-west-1'});
var sqs = new AWS.SQS({apiVersion: '2012-11-05'});

var waitingSQS = false;
var queueCounter = 0;

const processMessage = (messageSQS) => {
  messageSQS.forEach((content) => {
    console.log(`Processing message: ${JSON.parse(content.Body)}`);
    var params = {
      QueueUrl: 'https://sqs.us-east-2.amazonaws.com/457601403535/airbnb-bookings',
      ReceiptHandle: content.ReceiptHandle /* required */
    };
    sqs.deleteMessage(params, (err, data) => {
      if (err) {
        console.log(err);
      } else {
        console.log(`Deleted message RequestId ${JSON.stringify(data.ResponseMetadata.RequestId)}`);
      }
    });
  });
};

const receiveMessages = () => {
  var params = {
    QueueUrl: 'https://sqs.us-east-2.amazonaws.com/457601403535/airbnb-bookings', /* required */
    MaxNumberOfMessages: 10,
    VisibilityTimeout: 60,
    WaitTimeSeconds: 20
  };
  waitingSQS = true;
  sqs.receiveMessage(params, function(err, data) {
    if (err) {
      waitingSQS = false;
      console.log(err);
    } else {
      waitingSQS = false;
      if (data.Messages !== undefined) {
        processMessage(data.Messages);
      } else {
        queueCounter = 20;
        console.log (`The queue is empty - waiting for 20 seconds`);
      }
    }
  });
};

setInterval(function() {
  // console.log (queueCounter);
  if (!waitingSQS) {
    if (queueCounter <= 0) {
      receiveMessages();
    } else {
      queueCounter --;
    }
  } else {
    console.log (`Waiting on SQS`);
  }
}, 1000);