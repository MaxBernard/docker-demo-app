var express = require('express');
var cors = require('cors');
var path = require('path');
var fs = require('fs');
var MongoClient = require('mongodb').MongoClient;
var bodyParser = require('body-parser');

const ADMIN_USR='admin';
const ADMIN_PWD='password';
const DB_SERVER='tower-1:27017';

var app = express();

// ====================================
// Initialization

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(bodyParser.json());
app.use(cors());

// ====================================
// get 'index.html'

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ====================================
// Get profile-picture

app.get('/profile-picture', function (req, res) {
  var img = fs.readFileSync('/home/max/work/my-app/app/images/profile-1.jpg');
  console.log('Successfully read profile picture.');
  res.writeHead(200, {'Content-Type': 'image/jpg' });
  res.end(img, 'binary');
});

// ====================================
// get-profile

app.get('/get-profile', function (req, res) {
  var response = {};
  // Connect to the db
  console.log('Connecting to the db...');
  MongoClient.connect(`mongodb://${ADMIN_USR}:${ADMIN_PWD}@${DB_SERVER}`, function (err, client) {
    if (err) throw err;

    var db = client.db('user-account');

    var myquery = { userid: 1 };
    console.log('Successfully connected to the user-account db');
    
    db.collection("users").findOne(myquery, function (err, result) {
      if (err) throw err;
      response = result;
      client.close();
      
      // Send response
      res.send(response ? response : {});
    });
  });
});

// ====================================
// update-profile

app.post('/update-profile', function (req, res) {
  var userObj = req.body;

  console.log('Connecting to the db...');

  MongoClient.connect(`mongodb://${ADMIN_USR}:${ADMIN_PWD}@${DB_SERVER}`, function (err, client) {
    if (err) throw err;

    var db = client.db('user-account');
    userObj['userid'] = 1;
    
    var myquery = { userid: 1 };
    var newvalues = { $set: userObj };

    console.log('Successfully connected to the user-account db');
    
    db.collection("users").updateOne(myquery, newvalues, {upsert: true}, function(err, res) {
      if (err) throw err;
      console.log('Successfully updated or inserted a record.')
      client.close();
    });

  });
  // Send response
  res.send(userObj);
});

// ====================================
// start the server

app.listen(3000, function () {
  console.log("app listening on port 3000!");
});
