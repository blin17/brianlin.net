/*
 * GET home page.
 */
module.exports = function(app,io){
  app.get('/client/:id', function(req, res){
    res.render('client',{client_id: req.params.id});
  });

  app.get('/admin', function(req,res){
    res.render('admin');
  });

  var dict = {};

  io.on('connection', function(socket){
    console.log('user '+socket.id +' connected');
    socket.on('disconnect', function(){
      console.log('user '+socket.id +' disconnected');
    });
    
    socket.on('on_connect', function(id){
      console.log('user '+ id + ' is linked to socket id ' + socket.id);
      dict[id]= socket.id;
    });

    socket.on('chat message', function(msg){    

    var tokens = msg.split(", ");
    for (var i = 0; i < tokens.length-2; i+=3){
      
      var socket_id = dict[tokens[i]];
      var data = {
	'type' : tokens[i+1],
	'src' : tokens[i+2]
       };
      console.log(socket_id);
      io.to(socket_id).emit('refresh', data);
    }
     });
  });
  
};

