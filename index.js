const express = require('express')
const app = express()
const cors = require('cors')
const crypto = require('crypto');
const bodyParser = require("body-parser");
const { TableClient } = require("@azure/data-tables");
const { DefaultAzureCredential } = require('@azure/identity');
require('dotenv').config()

const exercise_users_table = 'exerciseUsers';
const exercise_records_table = 'exerciseRecords';

//https://learn.microsoft.com/en-us/azure/storage/blobs/storage-quickstart-blobs-nodejs?tabs=managed-identity%2Croles-azure-portal%2Csign-in-visual-studio-code#tabpanel_2_managed-identity
const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
if (!accountName) throw Error('Azure Storage accountName not found');

const dbEndpoint = `https://${accountName}.table.core.windows.net`;
const dbCredential = new DefaultAzureCredential()

const usersClient = new TableClient(
  dbEndpoint,
  exercise_users_table,
  dbCredential
);

const recordsClient = new TableClient(
  dbEndpoint,
  exercise_records_table,
  dbCredential
);


app.use(bodyParser.json());
app.use(cors())
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

//List all users (MAX 1000)
app.get('/api/users', async (req, res) => {
  try {
    let users = await fetchAllEntities(usersClient);
    res.json(users.map(x => {
      return {
      _id: x.rowKey,
      username: x.username
    };
  }));
  }
  catch (err) {
    console.error(err);
    res.json({ error: 'Internal server error' });
  }
});


//Create user
app.post('/api/users', async (req, res) => {
  try {
    //retreive user name from body
    const _userName = req.body.username;
    if (!_userName)
      throw new Error("No username provided.");

    //check is user with that name already exists and return if so
    const users = await fetchEntitiesByProperty(usersClient, "username", _userName);

    if (users.length > 0) {
      var user = {
        _id: users[0].rowKey,
        username: users[0].username
      };;
    }
    else {

      //create new user with GUID id (no dash)
      user = {
        _id: newUIDD(),
        username: _userName
      };

      //save user
      await usersClient.createEntity({
        partitionKey: "",
        rowKey: user._id,
        username: user.username
      });
    }

    //return user
    res.json({
      username: user.username,
      _id: user._id
    });
  }
  catch (err) {
    console.error(err);
    res.json({ error: 'Internal server error' });
  }
});

//Add exercises
app.post('/api/users/:_id/exercises', async (req, res) => {
  try {

  }
  catch (err) {
    console.error(err);
    res.json({ error: 'Internal server error' });
  }
});

//Query user exercises
app.get('/api/users/:_id/logs?[from][&to][&limit]', async (req, res) => {
  try {

  }
  catch (err) {
    console.error(err);
    res.json({ error: 'Internal server error' });
  }
});


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

function newUIDD() {
  return crypto.randomUUID().replace(/-/gi, '');
}

async function fetchAllEntities(tableClient) {
  try {
    let entities = [];
    let iter = tableClient.listEntities();
    for await (let entity of iter) {
      entities.push(entity);
    }
    return entities;
  } catch (error) {
    console.error(`Error occurred while fetching entities: ${error.message}`);
    throw error;
  }
}


async function fetchEntitiesByProperty(tableClient, propertyName, propertyValue) {
  return await fetchEntities(tableClient, `${propertyName} eq '${propertyValue}'`);
}

async function fetchEntities(tableClient, _filterPhrase) {
  try {
    let entities = [];
    let iter = tableClient.listEntities({
      queryOptions: { filter: _filterPhrase }
    });
    for await (let entity of iter) {
      entities.push(entity);
    }
    return entities;
  } catch (error) {
    console.error(`Error occurred while fetching entities: ${error.message}`);
    throw error;
  }
}

