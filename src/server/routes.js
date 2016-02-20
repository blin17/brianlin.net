/*
 * GET home page.
 */


module.exports = function(app,marked,archiver){
  var fs = require('fs');
  app.get('/', function(req, res){
      var path = __dirname + '/../markdown/index/home.md';
      var stats = fs.statSync(path);
      if (stats.isFile()){
        var file = fs.readFileSync(path, 'utf8');
        res.render('markdown_renderer', {markdown: marked(file)});
      }
  });   

  app.get('/about', function(req, res){
      var path = __dirname + '/../markdown/index/about.md';
      var stats = fs.statSync(path);
      if (stats.isFile()){
        var file = fs.readFileSync(path, 'utf8');
        res.render('markdown_renderer', {markdown: marked(file)});
      }
  });   

  app.get('/writing', function(req, res){
    res.render('writing');
  });   

  app.get('/chinese', function(req, res){
    try{
      res.render('markdown_renderer', {markdown: archiver.generateHTML("博客", __dirname+ "/../markdown/chinese/", {routing: "/chineseblog/"})});
    }
    catch (e){
      console.log(e);
      res.status(404).render('404');
    }
  });

  app.get('/projects', function(req, res){
    res.render('projects');
  });  

  app.get('/blog/:title', function(req, res){
    try{
      var path = __dirname + '/../markdown/writing/'+req.params.title+'.md';
      var stats = fs.statSync(path);
      if (stats.isFile()){
        var file = fs.readFileSync(path, 'utf8');
        res.render('markdown_renderer', {markdown: marked(file)});
      }
      else{
        res.status(404).render('404');
      }
    }
    catch(e){
      res.status(404).render('404');
    }
  });

  app.get('/chineseblog/:title', function(req,res){
    try{
      var path = __dirname + '/../markdown/chinese/'+req.params.title+'.md';
      var stats = fs.statSync(path);
      if (stats.isFile()){
        var file = fs.readFileSync(path, 'utf8');
        res.render('markdown_renderer', {markdown: marked(file)});
      }
      else{
        res.status(404).render('404');
      }
    }
    catch(e){
      res.status(404).render('404');
    }
  });
 
  app.use(function(req, res) {
      res.status(404).render('404');
  });
  
  app.get('/test', function(req, res){
    res.render('test');
  });  

};

