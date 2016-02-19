var express = require('express')
  , cons = require('consolidate')
  , validate = require('express-validator')
  , morgan = require('morgan')
  , fs = require('fs')
  , path = require('path')
  , FileStreamRotator = require('file-stream-rotator')
  , archiver = require('blog-archiver')
  , marked = require('marked');


var config = require('./config');

var App = function(){
  var self = this;

  self.initializeServer = function(){
    require('./src/server/routes')(self.app,marked, archiver);
  };

  self.logger = function(){
    var logDirectory = __dirname + '/log'
    fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);
    var accessLogStream = FileStreamRotator.getStream({
      filename: logDirectory + '/access-%DATE%.log',
      frequency: 'daily',
      verbose: false,
      date_format: 'YYYYMMDD'
    });
    self.app.use(morgan('combined', {stream: accessLogStream}));
  };

  self.initialize = function(){
    // all environments
    self.app = express();
    self.logger();
    marked.setOptions({
      renderer: new marked.Renderer(),
      gfm: true,
      tables: true,
      breaks: false,
      pedantic: false,
      sanitize: false,
      smartLists: true,
      smartypants: false
    });

    self.app.set('views', __dirname + '/src/views');
    self.app.set('view engine', 'html');
    self.app.engine('html', cons.ejs);
    //self.app.use(express.favicon());
    self.app.use(express.bodyParser());
    self.app.use(express.methodOverride());
    self.app.use(self.app.router);
    self.app.use(express.static(path.join(__dirname, 'public')));
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
