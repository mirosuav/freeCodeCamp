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

const dbEndpoint = process.env.DB_ENDPOINT;
const dbCredential = new DefaultAzureCredential()

// new AzureNamedKeyCredential(
//   "<account-name>",
//   "<account-key>"
// );

app.use(cors());

app.use(express.urlencoded({ extended: true }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.post('/api/shorturl', async function (req, res) {
  const orgUrl = req.body.url;

  if (validateUrl(orgUrl)) {

    const shortUlr = await shortenUrl(orgUrl);

    res.json({
      original_url: orgUrl,
      short_url: shortUlr
    });

  }
});

app.get('/api/shorturl/:shortUrl', async function (req, res) {
  const orgUrl = await getFullUrl(shortUlr);
  if (orgUrl) {
    res.redirect(orgUrl);
  }
  else {
    res.status(400);
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});

function validateUrl(orgUrl) {
  return new URL(orgUrl);
}

async function shortenUrl(orgUrl) {

  const tableClient = new TableClient(
    dbEndpoint,
    'shortedurls',
    dbCredential
  );

 const shortedUrl = hashCode(orgUrl);

  const entry = {
    partitionKey: "",
    rowKey: shortedUrl.toString(),
    url: orgUrl
  };

  await tableClient.createEntity(entry);

  return shortedUrl;
};

async function getFullUrl(shortUrl) {
  const tableClient = new TableClient(
    dbEndpoint,
    'shortedurls',
    dbCredential
  );

  let result = await tableClient.getEntity("", shortUrl)
  .catch((error) => {
    return undefined;
  });

  return result.url;
};

function hashCode(s) {
  for(var i = 0, h = 0; i < s.length; i++)
      h = Math.imul(31, h) + s.charCodeAt(i) | 0;
  return h;
}
