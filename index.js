require('dotenv').config();
const { TableServiceClient, TableClient, AzureNamedKeyCredential, odata } = require("@azure/data-tables");
const { DefaultAzureCredential } = require('@azure/identity');
const express = require('express');
const cors = require('cors');
const { URL } = require('url');
const dns = require('node:dns');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;
//https://learn.microsoft.com/en-us/azure/storage/blobs/storage-quickstart-blobs-nodejs?tabs=managed-identity%2Croles-azure-portal%2Csign-in-visual-studio-code#tabpanel_2_managed-identity
const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
if (!accountName) throw Error('Azure Storage accountName not found');

const dbEndpoint = `https://${accountName}.table.core.windows.net`;
const dbCredential = new DefaultAzureCredential()
const tableClient = new TableClient(
  dbEndpoint,
  'shortedUrl',
  dbCredential
);


app.use(cors());

app.use(express.urlencoded({ extended: true }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

//Get all shorted urls
app.get('/api/all', async function (req, res) {
  try {
    let result = await tableClient.listEntities();
    return { data: result };
  }
  catch (err) {
    console.log(err);
    res.json({ error: 'Internal server error' });
  }
});

//Create shorter url
app.post('/api/shorturl', async function (req, res) {
  try {
    const orgUrl = req.body.url;

    if (!validateUrl(orgUrl)) {
      res.json({ error: 'invalid url' });
      return;
    }

    const shortUrl = hashCode(orgUrl);
    
    const entry = {
      partitionKey: "",
      rowKey: shortUrl,
      url: orgUrl
    };
    await tableClient.upsertEntity(entry);
    //}

    res.json({
      original_url: orgUrl,
      short_url: shortUrl
    });

  }
  catch (err) {
    console.log(err);
    res.json({ error: 'Internal server error' });
  }
});

//Redirect by shorted URL
app.get('/api/shorturl/:shortUrl', async function (req, res) {
  try {
    const shortUrl = req.params.shortUrl;
    const entry = await tableClient.getEntity("", shortUrl.toString())
      .catch((error) => {
        throw error;
      });

    if (entry) {
      res.redirect(entry.url);
    }
    else {
      res.status(400);
    }
  }
  catch (err) {
    console.log(err);
    res.json({ error: 'Internal server error' });
  }
});


//Start server
app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});



function validateUrl(orgUrl) {
  try {
    const newUrl = new URL(orgUrl);
    return newUrl.protocol === 'http:' || newUrl.protocol === 'https:';
  } catch (err) {
    return false;
  }
}

function hashCode(s) {
  for (var i = 0, h = 0; i < s.length; i++)
    h = Math.imul(31, h) + s.charCodeAt(i) | 0;
  return h.toString();

  //Math.floor(Math.random() * 1000000).toString();
}
