//express to set the server
var express = require('express');
var app = express();
//request to communicate with the highcharts cloud
var request = require('request');
//cors to send/receive data inJ SON fomrat
var cors = require('cors');
//to set the public path where the index.html is saved
var path = require('path');

//config-json to store the passwords, API key, etc
var config=require('config-json');

//Mongoose to communicate with the database
var mongoose = require('mongoose');

//set the data structure
var Schema = mongoose.Schema;

//Set the server port (to listen) 
var port = process.env.PORT || 3000;

//To cleat screen
var clear = require('clear');

//Set up an empty chart structure, where I will save the data received from the database
var dataToSendObject = {
  data: {
    template: {},
    options: {
      title: {
        text: ""
      },
      series: [{}]
    }
  }
};
var chartID; //Chart id returned from Highchart cloud


config.load('./config.json')//Load the logins and passwords

//Retrieve data from the config.json file
var teamID = config.get('teamID'); //HCCloud team id
var APIKey = config.get('APIKey'); //HCCloud API key
var DBlogin = config.get('dbCredentials', 'DBlogin'),
  DBpwd = config.get('dbCredentials', 'DBpwd');// MongoBD's username and password
var DBLink = config.get('BLink');//MongoDB database link

/*{
    //HCCloud team id    
    "teamID" : 123456, 
    
    //HCCloud API key    
    "APIKey" : '123456', 
    
    // MongoBD's username and password    
    "dbCredentials":{
        "DBlogin" : 'name',
        "DBpwd" : '123456', 
    },
    //MongoDB database link
    "BLink" : '123x123x', 
}*/

var msgCodeOk = 200;//to replace the magic number 200

app.use(cors());
app.use('/', express.static(path.join(__dirname, 'public')));

//Read from the database
mongoose.connect('mongodb://' + DBlogin + ':' + DBpwd + DBLink);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("we're connected!");
});


var Schema = mongoose.Schema;
var chartSchema = new Schema({
  entity_id: String,
  title: Object,
  data: Array
});

var Chart = mongoose.model('Chart', chartSchema);



// **************************************************************************
//********* Communication App <=> myServer <=> HCCloud server ***************


//Read data from the data base

app.get('/readDataFromDB', function(reqUp, resUp) {
  Chart.find({}, function(err, data) { //Data represents the data fetched from the DB
    if (err) {
      return resUp.send({
        status: err
      });
    }
    console.log("Read from db: success");
    //Copy the title
    dataToSendObject.data.options.title.text = data[0].title;
    //Copy the data series
    dataToSendObject.data.options.series[0].data = data[0].data;

    //send status
    resUp.send({
      status: "Ok"
    });
  });

});


//create a chart on HCCloud
app.get('/sendToHCCloud', function(reqUp, resUp) {

  //Set up the request configuration
  var setChart = {

    url: 'https://cloud-api.highcharts.com/team/' + teamID + '/chart/',
    method: 'POST',
    headers: {
      'x-api-key': APIKey
    },
    json: true,
    body: dataToSendObject,
  };

  request(setChart, function(err, res, body) {

    if (!err && res.statusCode == msgCodeOk) {
      console.log("Create chart on Highcharts cloud:success");
      //save the chart id
      console.log("chart_id: " + body.chart_id);
      chartID = body.chart_id;
      resUp.send({
        status: res.statusMessage
      });

    } else {
      resUp.send({
        status: res.statusMessage
      });
    }
  });
});


//Duplicate chart
app.get('/duplicateChart', function(reqUp, resUp) {

  var setChart = {

    url: 'https://cloud-api.highcharts.com/team/' + teamID + '/chart/' + chartID + '/duplicate',
    method: 'POST',
    headers: {
      'x-api-key': APIKey
    },
    json: true,
  };

  request(setChart, function(err, res, body) {

    if (!err && res.statusCode == msgCodeOk) {
      console.log("Duplicate chart on Highcharts cloud:success");
      resUp.send({
        status: res.statusMessage
      });
    } else {
      console.log("error: " + err);
      console.log("res.statusCode: " + res.statusCode);
      resUp.send({
        status: res.statusMessage
      });
    }
  });
});


//Delete chart
app.get('/deleteChart', function(reqUp, resUp) {

  var setChart = {

    url: 'https://cloud-api.highcharts.com/team/' + teamID + '/chart/' + chartID,
    method: 'delete',
    headers: {
      'x-api-key': APIKey
    },
    json: true,
  };

  request(setChart, function(err, res, body) {

    if (!err && res.statusCode == msgCodeOk) {
      console.log("Delete chart on Highcharts cloud:success");
      resUp.send({
        status: res.statusMessage
      });
    } else {
      cresUp.send({
        status: res.statusMessage
      });
    }
  });

});

//           *** Start ***
clear(); //clear screen
console.log(' ***** Start session *** ');
console.log(' *****               *** ');
app.listen(port);
