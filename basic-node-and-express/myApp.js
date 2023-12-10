let express = require('express');
let app = express();
let bodyParser = require('body-parser');
require('dotenv').config();

app.use(function(req,res,next){
    console.log(`${req.method} ${req.path} - ${req.ip}`);
    next();
});

app.use(bodyParser.urlencoded({extended: false}));

app.use('/public', express.static(__dirname + '/public'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/views/index.html');
});

app.get('/:word/echo',(req,res) => {
    res.json({echo: req.params.word});
});

app.get('/now',function(req,res,next){
    req.time = new Date().toString();
    next();
}, function(req,res){
    res.json({time: req.time});
});

app.get('/json', function (req, res) {
    let message = "Hello json";
    if (process.env.MESSAGE_STYLE == 'uppercase')
        {
            message = message.toUpperCase();
        }
    let result = {
        "message": message
    }
    res.json(result);
});

function returnJsonFullName(req, res)
{
    res.json({ name: `${req.query.first || req.body.first} ${req.query.last || req.body.last}`});
}

app.route('/name').get(returnJsonFullName).post(returnJsonFullName);

































module.exports = app;
