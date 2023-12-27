const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const bodyParser = require("body-parser");
const { User, Exercise } = require("./domain.js");

app.use(bodyParser.json());
app.use(cors())
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


//List all users 
app.get('/api/users', async (req, res, next) => {
  try {
    const users = await User.fetchAll();
    res.json(users.map(u => u.asResponse()));
  }
  catch (err) {
    console.error(err);
    next(err);
  }
});


//Create user
app.post('/api/users', async (req, res, next) => {
  try {
    const user = await User.storeNew(req.body.username);
    res.json(user.asResponse());
  }
  catch (err) {
    console.error(err);
    next(err);
  }
});

//Add exercises
app.post('/api/users/:_id/exercises', async (req, res, next) => {
  try {
    let user = await User.fetchById(req.params._id);
    const exercise = await Exercise.storeNew(user, req.body.description, req.body.duration, req.body.date);
    res.json(exercise.asResponse());
  }
  catch (err) {
    console.error(err);
    next(err);
  }
});


//Query user exercises
//?[from][&to][&limit]
app.get('/api/users/:_id/logs', async (req, res, next) => {
  try {
    const user = await User.fetchById(req.params._id);
    if (!user) {
      res.sendStatus(404);
    }
    else {
      const logs = await Exercise.fetchLogArray(user, req.query.from, req.query.to, req.query.limit);

      res.json({
        username: user.name,
        count: logs.length,
        _id: user.id,
        log: logs
      })
    }
  }
  catch (err) {
    console.error(err);
    next(err);
  }
});

app.get('/api/logs', async (req, res, next) => {
  try {
    const logs = await Exercise.fetchAll();

    res.json(logs);

  }
  catch (err) {
    console.error(err);
    next(err);
  }
});



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})


