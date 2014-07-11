/*
 * GET home page.
 */
module.exports = function(app,io){
  app.get('/', function(req, res){
    res.render('client', hello);
  });   
  io.on('connection', function(socket){
   console.log('user '+socket.id +' connected');
   socket.on('disconnect', function(){
      console.log('user '+socket.id +' disconnected');
    });   
  });
};

