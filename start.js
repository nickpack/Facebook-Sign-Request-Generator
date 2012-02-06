var port = process.env.PORT || process.env.C9_PORT || 80;

var sys = require('util'),
    express = require('express'),
    resource = require('resource-router'),
    fs = require("fs");
    
var app = express.createServer();

function main(app) {
    app.resource('/', {
        'get': function(req, res) {
            res.render('index.html');
        }
    });
}

app.configure(function() {
    app.register('.html', require('ejs'));
    app.set('views', __dirname + '/views');
    app.set('view engine', 'html');
    app.use(express.favicon());
    // resource-router
    app.use(resource(main));
    app.use(express.static(__dirname + '/public', { maxAge: 604800000 }));
    app.use(express.staticCache());
});    


app.listen(port);