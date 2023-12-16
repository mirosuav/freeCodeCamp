// index.js
// where your node app starts

// init project
var express = require('express');
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors');
app.use(cors({ optionsSuccessStatus: 200 }));  // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

//current date time
app.get("/api", function (req, res) {
  let _date = new Date(Date.now());
  res.json({
    unix: _date.getTime(),
    utc: _date.toUTCString()
  });
});

//date time string
app.get("/api/:date", function (req, res, next) {
  
  const _dateUnix = Date.parse(req.params.date);
  if (!_dateUnix) {
    next();
    return;
  }
  
  let _date = new Date(_dateUnix);
  res.json({
    unix: _date.getTime(),
    utc: _date.toUTCString()
  });

});

// unix value
app.get("/api/:unix(\\d+)", function (req, res) {
  let _unix = parseInt(req.params.unix);
  res.json({
    unix: _unix,
    utc: new Date(_unix).toUTCString()
  });
});

app.get("/api/:invalid", function (req, res) {
  res.json({ error: "Invalid Date" });
});

// listen for requests :)
var listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
