// var AWS = require('aws-sdk');

// var sqs = new AWS.SQS({apiVersion: '2012-11-05'});

// var params = {
//   delaySeconds: .5,
//   MessageAttributes: {
//     'listid': {
//       DataType: 'Number',
//       StringValue: '101'
//     },
//     'beginDate': {
//       DataType: 'String',
//       StringValue: '2017-12-20'
//     },
//     'endDate': {
//       DataType: 'String',
//       StringValue: '2017-12-22'
//     }
//   },
//   MessageBody: 'Successful booking',
//   QueueUrl: 'https://sqs.us-east-2.amazonaws.com/457601403535/airbnb-bookings'
// };


// sqs.listQueues(params, function(err, data) {
//   if (err) {
//     console.log('Error', err);
//   } else {
//     console.log('Success', data.MessageId);
//   }
// });

// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
// AWS.config.update({region:'us-west-1'});
// AWS.config.update({accessKeyId: "AKIAIQ3QZKRFTJZ3ONSA",
//   secretAccessKey: "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", region: 'us-west-2'});
// Set the region 

// Create an SQS service object
var sqs = new AWS.SQS({apiVersion: '2012-11-05'});


for (var i = 0; i < 2000; i ++) {
  var numberString = ''.concat(i);
  var message = {
    'listing': {
      DataType: 'Number',
      StringValue: numberString
    },
    'beginDate': {
      DataType: 'String',
      StringValue: '1800-12-20 00:00:00'
    },
    'endDate': {
      DataType: 'String',
      StringValue: '1800-12-21 00:00:00'
    }
  };
  var params = {
    MessageBody: JSON.stringify(message),
    QueueUrl: 'https://sqs.us-east-2.amazonaws.com/457601403535/airbnb-bookings'
  };
  sqs.sendMessage(params, function(err, data) {
    if (err) {
      console.log("Error", err);
    } else {
      console.log("Success", data.MessageId);
    }
  });
}