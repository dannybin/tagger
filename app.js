
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var tagged = require('./routes/tagged');
var http = require('http');
var path = require('path');


var app = express();
var hbs = require('hbs');

var r = require('rethinkdb');
var connection = null;
r.connect( {host: '162.242.238.193', port: 28015}, function(err, conn) {
    if (err) throw err;
    conn.use('jurispect');
    routes.connection = conn;
    tagged.connection = conn;
})

hbs.registerHelper('if_set', function(a, opts) {
    if(a != 'undefined')
        return opts.fn(this);
    else
        return opts.inverse(this);
});

app.set('view engine', 'html');
app.engine('html', hbs.__express);

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));

app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.post('/', routes.update);
app.get('/tagged', tagged.index);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
