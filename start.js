var port = process.env.PORT || process.env.C9_PORT || 80;

var sys = require('util'),
    express = require('express'),
    fs = require("fs");
    
var app = express.createServer();

app.configure(function() {
    app.register('.html', require('ejs'));
    app.set('views', __dirname + '/views');
    app.set('view engine', 'html');
    app.use(express.favicon());
    app.use(express.methodOverride());
    app.use(express.bodyParser());
    // resource-router
    app.use(app.router);
    app.use(express.static(__dirname + '/public', { maxAge: 604800000 }));
    app.use(express.staticCache());
});

app.get('/', function(req, res, next) {
    res.local("secretKey", "");
    res.local("payload", "");
    res.local("errored", false);
    res.local("jsonPayload", null);
    res.render('index.html');
});
app.post('/', function(req,res,next) {
    try
    {
        var SignedRequest = require("./signedrequest");
        SignedRequest.secret = req.body.secretKey;
        
        res.local("secretKey", req.body.secretKey);
        res.local("payload", req.body.payload);
        
        if(req.body.secretKey == "" || req.body.payload == "")
        {
            res.local("errored", true);
            res.local("jsonPayload", "Payload and secret key can not be empty.");
        }
        else
        {
            var jsonPayload = SignedRequest.encodeAndSign(JSON.parse(req.body.payload));
            res.local("errored", false);
            res.local("jsonPayload", jsonPayload);
        }
        res.render('index.html');
    }
    catch(err)
    {
        res.local("secretKey", req.body.secretKey);
        res.local("payload", req.body.payload);
        res.local("errored", true);
        res.local("jsonPayload", JSON.stringify(err));
        res.render('index.html');
    }
});

app.listen(port);