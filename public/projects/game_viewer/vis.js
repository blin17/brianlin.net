const width = 600;
const height = 300;
var first_event = 0;
var index_event = 0;
var index_moment = 0;

var new_file = 1;
var events_length = 500;
var current_game_clock = 0;
var filepath = '';
var stop_event = 550;
var interval = null;
var animation_speed = 21;



var github_path = 'https://raw.githubusercontent.com/blin17/nba_data/master'
var blin_path = 'http://brianlin.net/json_data/nba'
var game_name = '11.18.2015.POR.at.HOU'
var game_names = ['11.18.2015.POR.at.HOU','12.31.2015.GSW.at.HOU', '01.15.2016.CLE.at.HOU'
					,'11.19.2015.GSW.at.LAC','12.25.2015.SAS.at.HOU','12.31.2015.GSW.at.HOU'
					, '01.04.2016.BOS.at.BKN']
var home_color = '#666'
var ball_color = 'orange'
var team_colors = {
	'POR':'#CE1141',
	'HOU':'#CE1141',
	'GSW':'#FDB927',
	'CLE':'#860038',
	'SAS':'#000000',
	'BOS':'#008348',
	'BKN':'#000000'
};

var game_index = 0
var file_event_start= 0
var file_event_end = file_event_start + 10

var last_known_good_moment = null;
var animate_on = true


var player_width = 7;
var ball_width = 2;

var div_name = "<div></div>";
var left_div = "<div id='left'></div>";
var right_div = "<div id='right'></div>";
var dropdown_div = '<div class="dropdown">'+
				'<button class="btn btn-secondary dropdown-toggle btn-sm" type="button" data-toggle="dropdown">Choose NBA Game'+
				'<span class="caret"></span></button>'+
				'<ul class="dropdown-menu" id="game-chooser">'+
				'</ul></div>';
var current_div = null;


var xValue = function(d) { return d.x;}, // data -> value
    xScale = d3.scaleLinear().domain([0,100]).range([0, width+50]), // value -> display
    xMap = function(d) { return xScale(xValue(d));}, // data -> display
    xMapT = function(d) { return xScale(xValue(d))+10;}; // data -> display

var yValue = function(d) { return d.y;}, // data -> value
    yScale = d3.scaleLinear().domain([0, 50]).range([0,height]), // value -> display
    yMap = function(d) { return yScale(yValue(d));}, // data -> display
    yMapT = function(d) { return yScale(yValue(d));}; // data -> display




function get_file_path(i){
	fp = blin_path + '/' + game_names[i] 
			+ '/event' + file_event_start + '-' + file_event_end + '.'+ game_names[i] + '.json';
	return fp
}

function add_players(div, team){
	i_html = div.html()

	players_arr = team.players
	id = team.teamid
	players = {}
	i_html += '<ul class = '+id+'>'
	for (p in players_arr){
		i_html += ('<li class= '+players_arr[p]['playerid']+'><span class=position>' + players_arr[p]['position'] + "</span> "
					+ players_arr[p]['firstname'] + " " 
					+ players_arr[p]['lastname'] + " #" + players_arr[p]['jersey'])
		i_html += "</li>"
		players[players_arr[p]['playerid']] = {}
		players[players_arr[p]['playerid']].jersey = players_arr[p]['jersey']
		players[players_arr[p]['playerid']].firstname = players_arr[p]['firstname']
		players[players_arr[p]['playerid']].lastname = players_arr[p]['lastname']
	}
	i_html += '</ul>'
	div.html(i_html)
	return players
}


filepath = get_file_path(game_index);
animate(filepath, 0);



$('<div>').attr('class', 'dropdown')


function animate(file_name, add_on){
	d3.json(file_name
	, function(error, game_data){
		if (error) throw error;
		if (current_div != null){
			current_div.hide()
			current_div.remove()
		}
		current_div = $(div_name)
		inner_div = $(div_name)
		inner_div.attr('id', 'main'+file_event_start)
		inner_div.attr('class', 'main')

		game_div = $('<div>').attr('id','gamename').append(game_names[game_index])

		$('body').append(current_div)
		current_div.append([dropdown_div,game_div])
		current_div.append(inner_div)

		for (i in game_names){
			console.log(game_names[i])
			game = $('<li>').append($('<a>').attr('href','#').append(game_names[i])).val(i)
			game.bind('click', function(){
				game_index = $(this).val()
				clearInterval(interval);

				file_event_start= 0
				file_event_end = file_event_start + 10

				index_event = 0;
				index_moment = 0;
				new_file = 1;
				current_game_clock = 0;

				filepath = get_file_path(game_index);
				animate(filepath, 0);

			});
			$('#game-chooser').append(game);
		}

		inner_div.append(right_div)
		inner_div.append(left_div)
		events = game_data.events

		index_event = Math.min.apply(null, Object.keys(events).map(Number)) + add_on
		first_event = index_event
		events_length = Object.keys(events).length + index_event

		/// CHANGE THIS FOR SETTING MOMENT
		if (file_event_start == 10){
		//	index_event = 15
		//	index_moment = 400
		}
		/// CHANGE THIS FOR SETTING MOMENT

		while (events[index_event] == null){
			index_event +=1
		}
		home = events[index_event]['home'];
		visitor = events[index_event]['visitor'];

		home_div = $("<div>"+home.name+"</div>");
		home_div.attr('id', 'home');
		visitor_div = $("<div>"+visitor.name+"</div>");
		visitor_div.attr('id', 'visitor');

		$('#left').append([home_div,visitor_div]);

		home_p = add_players(home_div, home);
		visiting_p = add_players(visitor_div, visitor);

		$('.'+visitor.teamid + ' li').css('color', team_colors[visitor.abbreviation])
		if (visitor.abbreviation == 'SAS' || visitor.abbreviation == 'BKN'){
			$('.'+visitor.teamid + ' li').css('color', 'silver')
		}
		players = {}
		for (var attrname in home_p) 
			{ players[attrname] = home_p[attrname]; }

		for (var attrname in visiting_p) 
			{ players[attrname] = visiting_p[attrname]; }

		quarter = 0
		gameclock = 0
		shotclock = 0
		score_div = $("<div></div>");
		score_div.attr('id', 'scoreboard');

		$('#right').append(score_div);
		slider_holder = $('<div id=speed_slider_holder></div>')
		slider_input  = $('<div id=speed_slider></div>')
		slider_text  = $('<div>Speed: '+(51-animation_speed)+'</div>')
		slider_holder.append([slider_text,slider_input]);


		button_div = $('<button type=button class="pause btn btn-secondary btn-sm">Pause</button>')
		
		e_slider_holder = $('<div id=event_slider_holder></div>')
		e_slider_input  = $('<div id=event_slider></div>')
		e_slider_text  = $('<div>Event: '+(index_event)+'</div>')
		e_slider_holder.append([e_slider_text,e_slider_input]);

		$('#right').append([button_div,slider_holder,e_slider_holder]);

		$( function() {
			$( "#event_slider" ).slider({
				'min': 0, 
				'max':stop_event,  
				"value": index_event, 
				change: function( event, ui ) {
			    	event_val = ui.value;
					e_slider_text.html('Event: '+index_event);
					if (event_val >=0 && event_val < stop_event){
						clearInterval(interval);

						file_event_start= Math.round(event_val/10)*10
						file_event_end = file_event_start + 10

						index_event = 0;
						index_moment = 0;
						new_file = 1;
						current_game_clock = 0;

						filepath = get_file_path(game_index);
						animate(filepath, event_val-file_event_start);
					}
				}
			})
		});

		$(function(){
		    $('.pause').on('click',function(){
			if (animate_on){
				animate_on = false;
				clearInterval(interval);
				$('.pause').html('Continue')
			}
			else{
				animate_on = true
				$('.pause').html('Pause')
				interval = setInterval(function(){
					if (index_event < events_length){
						draw();}
					else{
						clearInterval(interval); 
						if (index_event < stop_event){
							file_event_start+= 10; 
							file_event_end+=10; 
							filepath = get_file_path(game_index);
							index_moment = 0;
							new_file = 1;
							animate(filepath,0);
						}
					}
				},animation_speed);
			}
		    });
		});


		$( function() {
			$( "#speed_slider" ).slider({
				'min': 1, 
				'max':50,  
				"value": (51-animation_speed), 
				change: function( event, ui ) {animation_speed =(51-ui.value);
					slider_text.html('Speed: '+ui.value);
					clearInterval(interval);
					interval = setInterval(function(){
						if (index_event < events_length){
							draw();}
						else{
							clearInterval(interval); 
							if (index_event < stop_event){
								file_event_start+= 10; 
								file_event_end+=10; 
								filepath = get_file_path(game_index);
								index_moment = 0;
								new_file = 1;
								animate(filepath,0);
								//console.log('hello');
							}
						}
					},animation_speed);
				}
			});
		} );

		var svg = d3.select( '#right')
		.append( "svg" )
		.attr( "width", width )
		.attr( "height", height )

		function draw(){
			while (events[index_event] == null){
				index_event +=1;
			}
			moments = events[index_event]['moments']
			if (index_moment >= moments.length && new_file != 1){
				index_event += 1
				index_moment = 0
				if (events[index_event] == null){
					 return;
				}
				moments = events[index_event]['moments']
			}

			if (moments.length == 0){
				index_event +=1
				return;
			}

			moment = moments[index_moment]

			if (moment == null){
				return ;
			}


			if (moment[1] < current_game_clock){
				moment = last_known_good_moment
				index_moment +=50
				//return;
			}
			//else{
			quarter = moment[0]
			gameminutes = Math.floor(moment[2]/60)
			gameseconds = Math.round((moment[2]/60 - Math.floor(moment[2]/60))*60)
			if (gameseconds < 10){
				gameseconds = '0'+gameseconds
			}
			if (gameminutes < 10){
				gameminutes = '0'+gameminutes
			}
			shotclock = Math.round(moment[3] *10)/10
			current_game_clock = moment[1]
			
			score_div.html("<ul><span class = scores>" + 
							"<li><span class = title>Quarter: </span>" + quarter + "</li>" + 
							"<li><span class = title>Game Clock: </span>" + gameminutes +":"+gameseconds + "</li>" + 
							"<li><span class = title>Shot Clock: </span>" + shotclock + "</li></span>" + 
							"<li>Event:"+index_event+" Moment:" + index_moment +"</li></ul>");

			$("."+home.teamid).children('li').each(function(f){
				$(this).hide()
			})
			$("."+visitor.teamid).children('li').each(function(f){
				$(this).hide()
			})
			moment[5].forEach(function(f){

				f.team_id = f[0]
				f.player_id = f[1]
				f.x = f[2]
				f.y = f[3]
				f.h = f[4]
				$("."+f[1] ).show()
			});
			if ((index_event == first_event && index_moment ==0 )|| (new_file == 1)){
				new_file = 0
		        var nodes = svg
				.selectAll("g")
		        .data(moment[5])
		        .enter()
		        .append('g')
				
				var dots = 
				nodes
				.append("circle")
				.attr("cx", xMap)
				.attr("cy", yMap)
				.attr('class', function (d){if(d.player_id == -1) {return 'ball'}
										else{return players[d.player_id]}})
				.attr("r", function(d){if(d.player_id == -1) {return ball_width+d.h}
										else{return player_width}})
		      	.style("fill", function(d){if(d.team_id == -1) {return ball_color}
										else if(d.team_id == home.teamid){return home_color}
										else {return team_colors[visitor.abbreviation]}});
		        
				var labels = 
				nodes
				.append("text")
				.attr("x", xMap)
				.attr("y", yMap)
				.text(function (d){if(d.player_id == -1) {return null}
										else{return players[d.player_id].lastname}});
				
				svg.selectAll("g").sort(function (a, b) { 		// select the parent and sort the path's
				      if (a.team_id > b.team_id) return -1;		// a is not the hovered element, send "a" to the back
				      else return 1;                         	// a is the hovered element, bring "a" to the front
				  });
			}
			else{
				last_known_good_moment = moment
				nodes = svg
				.selectAll("g")
		        .data(moment[5])

		        nodes.select("circle")
				.attr("cx", xMap)
				.attr("cy", yMap)
				.attr('class', function (d){if(d.player_id == -1) {return 'ball'+ index_event}
										else{return players[d.player_id]}})
				.attr("r", function(d){if(d.player_id == -1) {return ball_width+d.h}
										else{return player_width}})
		      	.style("fill", function(d){if(d.team_id == -1) {return ball_color}
										else if(d.team_id == home.teamid){return home_color}
										else {return team_colors[visitor.abbreviation]}});
				nodes
				.select("text")
				.attr("x", xMapT)
				.attr("y", yMapT)
				.text(function (d){if(d.player_id == -1) {return null}
										else{return players[d.player_id].lastname}});
				
				svg.selectAll("g").sort(function (a, b) { 		// select the parent and sort the path's
				      if (a.team_id > b.team_id) return -1;		// a is not the hovered element, send "a" to the back
				      else return 1;                         	// a is the hovered element, bring "a" to the front
				  });
			}
			index_moment +=1
			//}
		}

		interval = setInterval(function(){
							if (index_event < events_length){
								draw();}
							else{
								clearInterval(interval); 
								if (index_event < stop_event){
									file_event_start+= 10; 
									file_event_end+=10; 
									filepath = get_file_path(game_index);
									index_moment = 0;
									new_file = 1;
									animate(filepath,0);
									//console.log('hello');
								}
							}
						},animation_speed);
	})
}
