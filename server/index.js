var apm = require('elastic-apm-node').start({
  // Set required app name (allowed characters: a-z, A-Z, 0-9, -, _, and space)
  appName: 'bookings-service',
  // Set custom APM Server URL (default: http://localhost:8200)
  serverUrl: 'http://localhost:8200',
  flushInterval: 1,
  maxQueueSize: 100,
  stackTraceLimit: 100
});

var express = require('express');
var axios = require('axios');
// var db = require('../database/index.js');
var db = require('../database/postgres-database.js');
var request = require('request');
var AWS = require('aws-sdk');
var bodyParser = require('body-parser');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(apm.middleware.express());

// Create an SQS service object
AWS.config.loadFromPath(__dirname + '/../awsConfig.json');
var sqs = new AWS.SQS({apiVersion: '2012-11-05'});

var waitingSQS = false;
var queueCounter = 0;

var server = app.listen(5000, function () {
  var port = server.address().port;
  console.log('Listening to port ', port);
});

const processMessage = (messageSQS) => {
  messageSQS.forEach((content) => {
    var bookingRequest = JSON.parse(content.Body);
    var tempId = bookingRequest.listing.StringValue;
    var begin = new Date(bookingRequest.beginDate.StringValue);
    var end = new Date (bookingRequest.endDate.StringValue);
    db.createReservation(tempId, begin, end)
      .then((dateAvailability) => {
        console.log(`From the server ${dateAvailability}`);
        if (dateAvailability) {
          console.log(`Inserted ${begin} to ${end} for ${tempId}`);
          db.insertReservation(tempId, new Date(bookingRequest.beginDate.StringValue), end);
          var params = {
            MessageBody: content.Body,
            QueueUrl: 'https://sqs.us-east-2.amazonaws.com/457601403535/master_downstream_history'
          };
          sqs.sendMessage(params, function(err, data) {
            if (err) {
              console.log('Error', err);
            } else {
              console.log('Success', data.MessageId);
            }
          });
        }
      });
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

app.post('/processMessage', (req, res) => {
  processMessage(req.body.params.data);
  res.send('ok');
});

const receiveMessages = () => {
  var params = {
    QueueUrl: 'https://sqs.us-east-2.amazonaws.com/457601403535/airbnb-bookings', /* required */
    MaxNumberOfMessages: 10,
    VisibilityTimeout: 60,
    WaitTimeSeconds: 1
  };
  waitingSQS = true;
  sqs.receiveMessage(params, function(err, data) {
    if (err) {
      waitingSQS = false;
      console.log(err);
    } else {
      waitingSQS = false;
      if (data.Messages !== undefined) {
        axios.post('http://localhost:5000/processMessage', {
          params: {
            data: data.Messages
          }
        })
          .then(() => {
            console.log(`Finished request`);
          })
          .catch((err) => {
            console.log(`Got an error: ${err}`);
          });
        // processMessage(data.Messages);
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
}, 10);

module.exports = server;


// app.get('/reserve', (req, res) => {
//   var begin = new Date ('2016-12-23 12:00:00');
//   var end = new Date ('2016-12-31 12:00:00');
//   var tempId = 99;
//   // begin.setDate(begin.getDate() + Math.random() * 5);
//   // console.log(begin);
//   db.createReservation(tempId, begin, end)
//     .then((dateAvailability) => {
//       console.log(`From the server ${dateAvailability}`);
//       if (dateAvailability) {
//         db.insertReservation(tempId, begin, end);
//       }
//       res.send();
//     });
// });