/*
 * GET home page.
 */


module.exports = function(app,marked){
  var fs = require('fs');
  app.get('/', function(req, res){
    res.render('index');
  });   


  app.get('/blog', function(req, res){
    res.render('blog');
  });   

  app.get('/blog/:title', function(req, res){
    try{
      var path = __dirname + '/../blog/'+req.params.title+'.md';
      var stats = fs.statSync(path);
      if (stats.isFile()){
        var file = fs.readFileSync(path, 'utf8');
        res.render('blog_template', {blog: marked(file)});
      }
      else{
        res.status(404).render('404');
      }
    }
    catch(e){    
      console.log("e: " + e);
      res.status(404).render('404');
    }

  });


  app.get('/projects', function(req, res){
    res.render('projects');
  });   
  app.use(function(req, res) {
      res.status(404).send('error');
  });

};

