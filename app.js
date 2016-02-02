var express = require('express')
  , cons = require('consolidate')
  , validate = require('express-validator')
  , http = require('http')
  , path = require('path');

var config = require('./config');
var App = function(){
  var self = this;

  self.initializeServer = function(){
    require('./src/server/routes')(self.app,self.marked);
  };

  self.initialize = function(){
    // all environments

    self.app = express();
    
    self.app.set('views', __dirname + '/src/views');
    self.app.set('view engine', 'html');
    self.app.engine('html', cons.ejs);
    //self.app.use(express.favicon());
    //self.app.use(express.logger('dev'));
    self.app.use(express.bodyParser());
    self.app.use(express.methodOverride());
    self.app.use(self.app.router);
    self.app.use(express.static(path.join(__dirname, 'public')));

    self.marked = require('marked');
    self.marked.setOptions({
      renderer: new self.marked.Renderer(),
      gfm: true,
      tables: true,
      breaks: false,
      pedantic: false,
      sanitize: true,
      smartLists: true,
      smartypants: false
    });
  }

  self.start = function(){
    self.server = self.app.listen(config.web.port, function(){
       console.log("Express started on port "+ config.web.port);
    });

    self.initializeServer();
  }
};
 
var app = new App();
app.initialize();
app.start();
