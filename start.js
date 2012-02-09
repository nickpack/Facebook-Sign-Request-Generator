var port = process.env.PORT || process.env.C9_PORT || 80;

var sys = require('util'),
    express = require('express'),
    fs = require("fs");
    
var app = express.createServer();

app.configure(function() {
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.register('.html', require('ejs'));
    app.set('views', __dirname + '/views');
    app.set('view engine', 'html');
    app.use(express.favicon());    
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

app.post('/v1/generate', function(req, res, next) {
    res.contentType('application/json');
    try
    {
        var SignedRequest = require("./signedrequest");
        SignedRequest.secret = req.body.secretKey;
        
        if(req.query.secretKey != undefined && req.query.secretKey.length > 0) {
            var body = req.body;
            
            if(body && body != undefined && body != null) {
                var jsonPayload = SignedRequest.encodeAndSign(JSON.stringify(body));
                
                var msg = { success : true, signedRequest : jsonPayload };
    		    res.send(JSON.stringify(msg));
            }
            else
            {
                var msg = { success : false, error : "Missing payload." };
        	    res.send(JSON.stringify(msg));
            }
        }
        else
        {
            var msg = { success : false, error : "Missing secret key." };
            res.send(JSON.stringify(msg));
        }
            
    }
    catch(err)
    {
        var msg = { success : false, error : err };
        res.send(JSON.stringify(msg));
    }
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