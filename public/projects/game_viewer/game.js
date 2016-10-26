// CSS + Animation
const player_width = 7;
const ball_width = 2;
const ball_color = 'orange';
const home_color = '#666';
const team_colors = {
	'POR':'#CE1141',
	'HOU':'#CE1141',
	'GSW':'#006BB6',
	'CLE':'#860038',
	'SAS':'#000000',
	'BOS':'#008348',
	'BKN':'#000000'
};

let width = 600;
let height = 300;
function set_canvas_size(){
	width = $(document.body).width() *.8
	if (width > 600){
		width = 600;
	}
	height = width /2;
}
set_canvas_size()

let animation_speed = 21;
let first_animation = true;
let is_animating = true;

// Data
const data_path = 'https://raw.githubusercontent.com/blin17/nba_data/master/';
const data_path2 = 'http://brianlin.net/json_data/nba'
const game_names = ['11.18.2015.POR.at.HOU','11.19.2015.GSW.at.LAC','12.21.2015.CHA.at.HOU'
					,'12.25.2015.SAS.at.HOU','12.31.2015.GSW.at.HOU'
					, '01.04.2016.BOS.at.BKN', '01.15.2016.CLE.at.HOU']
const getDataPath = function (game_id, frame_num) {
  return `${data_path}/${game_names[game_id]}/frame${frame_num}-${game_names[game_id]}.json`;
}
const getPlayByPlayPath = function(game_id) {
	  return `${data_path}/play_by_play/play.by.play-${game_names[game_id]}.json`;
}

// Indexes
let home = null;
let visitor = null;
let players = null;
let game_date = null;
let frames = null;
let max_frames = null;
let num_moments = null;
let current_players = null;
let game_index = 0;
let frame_index = 0;
let moment_index = 0;
let interval = null;
let play_by_play_index = 0;
let last_score = '0 - 0';

// d3
const xScale = d3.scaleLinear().domain([0,100]).range([0, width*1.075]);
const yScale = d3.scaleLinear().domain([0, 50]).range([0,height]);
const xMap = function(datum) {return xScale(datum.x)};
const xMapText = function(datum) {return xScale(datum.x) + 10};
const yMap = function(datum) {return yScale(datum.y)};
const getColor = function(datum) {
	if (datum.team_id == -1){
		return 'orange';
	} else if (datum.team_id == home.teamid){
		return home_color;
	} else {
		return team_colors[visitor.abbreviation];
	}
}

const getRadius = function(datum) {
	if (datum.team_id == -1) {
		return datum.h + 2;
	} else{
		return player_width;
	}
}

const getText = function(datum){
	if (datum.team_id == -1) {
		return null;
	} else {
		return players[datum.player_id].lastname;
	}
}

const drawInterval = function(){
	if (moment_index < num_moments){
		draw(frames[moment_index]);
	} else {
		clearInterval(interval); 
		frame_index += 1;
		if (frame_index <= max_frames) {
			loadGame(getDataPath(game_index, frame_index));
		}
	}
}

/**
 * Sorts elements such that basketball will be at the front.
 * This is important because Canvas draws z-index by the ordering in DOM.
 */
const sortBallFirst = function (a, b) {
	if (a.team_id > b.team_id){
		return -1;
	} else{
		return 1;
	}
}

// DOM Elements
let svg = null;

// Rest of File
function setGameInfo(date, team1, team2) {
	return `${team1} <span class=score>${last_score}</span> ${team2} <span class=date>${date}</span>`
	
}

/**
 * given a home team object, this makes a hashmap for each player
 * returs hashmap of playerid to teamid, firstname, lastname, and jersey #
 */
function createPlayerList(team1, team2) {
	var players = {}
	for (p in team1.players) {
		players[team1.players[p]['playerid']] = {
			teamid: team1['teamid'],
			jersey: team1.players[p]['jersey'],
			firstname: team1.players[p]['firstname'],
			lastname: team1.players[p]['lastname']
		};
	}
	for (p in team2.players) {
		players[team2.players[p]['playerid']] = {
			teamid: team2['teamid'],
			jersey: team2.players[p]['jersey'],
			firstname: team2.players[p]['firstname'],
			lastname: team2.players[p]['lastname']
		};
	}
	return players;
}

function createTeamDiv(team){
	let team_div = $("<div>"+team.name+"</div>")
			.attr('id', team.abbreviation);

	let player_ul = $('<ul>').attr('class', team.teamid);
	for (p in team.players){
		player_li = $("<li class= " +team.players[p]['playerid'] + "> "
					+ "<span class=position>" + team.players[p]['position'] + "</span> "
					+ team.players[p]['firstname'] 
					+ " " + team.players[p]['lastname'] 
					+ " #" + team.players[p]['jersey']
					+ "</li>");
		player_ul.append(player_li);
	}
	team_div.append(player_ul);
	return team_div;
}

function loadScoresIntoScoreboard(moment){
	let quarter = moment.quarter;
	let gameminutes = Math.floor(moment.game_clock/60);
	if (gameminutes < 10){
		gameminutes = '0'+gameminutes;
	}
	let gameseconds = Math.round((moment.game_clock/60 - Math.floor(moment.game_clock/60))*60);
	if (gameseconds < 10){
		gameseconds = '0'+gameseconds;
	}
	let shotclock = Math.round(moment.shot_clock *10)/10;
	$(".scoreboard").html("<ul><span class = scores>" + 
					"<li><span class = title>Quarter: </span>" + quarter + "</li>" + 
					"<li><span class = title>Game Clock: </span>" + gameminutes +":"+gameseconds + "</li>" + 
					"<li><span class = title>Shot Clock: </span>" + shotclock + "</li></span>" + 
					"<li>Frame:"+frame_index+" Moment:" + moment_index +"</li></ul>");
	if (quarter > next_quarter) {
		play_by_play_index +=1;
		next_quarter = play_by_play['PERIOD'][play_by_play_index];
		next_game_clock = play_by_play['GAMECLOCK'][play_by_play_index];
	} else if (quarter == next_quarter && moment.game_clock <= next_game_clock){
		score = play_by_play['SCORE'][play_by_play_index]
		play_li = $('<li>').attr('class','play').append(($('<span>').attr('class','play_by_play_date').append(play_by_play['PCTIMESTRING'][play_by_play_index] + ' ')));
		if (score != null){
			last_score = score
			$('.gameinfo').html(setGameInfo(game_date, visitor.abbreviation, home.abbreviation));
			play_li.attr('class','scoring_play')
		}

		home_play = play_by_play['HOMEDESCRIPTION'][play_by_play_index]
		visitor_play = play_by_play['VISITORDESCRIPTION'][play_by_play_index]
		if (home_play != null || visitor_play!= null) {
			if (home_play != null) {
				play_li.append(home_play)
			} else {
				play_li.append(visitor_play)
			}
			play_by_play_ul = $('.play_by_play')
			if (play_by_play_ul.children().length <= 5) {
				play_by_play_ul.append(play_li);
			} else {
				play_by_play_ul.children().first().remove();
				play_by_play_ul.append(play_li);
			}
		}
		play_by_play_index +=1;
		next_quarter = play_by_play['PERIOD'][play_by_play_index];
		next_game_clock = play_by_play['GAMECLOCK'][play_by_play_index];
	
	}
}

function updatePlayerList(player_list) {
	$("."+home.teamid).children('li').each(function(f){
		$(this).hide();
	})
	$("."+visitor.teamid).children('li').each(function(f){
		$(this).hide();
	})
	for (p in player_list){
		//console.log(player_list);
		$("." + p).show();
	}
}

function createPauseButton(){
	button_div = $('<button type=button class="pause btn btn-secondary btn-sm">Pause</button>');
	$(function(){
		button_div.on('click',function(){
			if (is_animating){
				is_animating = false;
				$('.pause').html('Continue');
				clearInterval(interval);
			} else {
				is_animating = true;
				$('.pause').html('Pause');
				interval = setInterval(drawInterval, animation_speed);
			}
		});		
	});
	return button_div;
}

function resetIndex(){
	home = null;
	visitor = null;
	players = null;
	game_date = null;
	frames = null;
	max_frames = null;
	num_moments = null;
	current_players = null;
	interval = null;
}

function createSpeedSlider(){
	slider_holder = $('<div id=speed_slider_holder></div>')
	slider_input  = $('<div id=speed_slider></div>')
	slider_text  = $('<div>Speed: '+(51-animation_speed)+'</div>')
	slider_holder.append([slider_text,slider_input]);
	$( function() {
		slider_input.slider( {
			'min': 1, 
			'max': 50,  
			"value": (51-animation_speed), 
			change: function( event, ui ) {
				animation_speed =(51-ui.value);
				slider_text.html('Speed: '+ui.value);
				clearInterval(interval);
				interval = setInterval(drawInterval, animation_speed);
			}
		});
	});
	return slider_holder;
}

function createEventSlider() {
	e_slider_holder = $('<div id=event_slider_holder></div>')
	e_slider_input  = $('<div id=event_slider></div>')
	e_slider_text  = $('<div>Frame: '+(frame_index)+'</div>')
	e_slider_holder.append([e_slider_text,e_slider_input]);
	$(function() {
		e_slider_input.slider( {
			'min': 0, 
			'max':max_frames,  
			"value": frame_index, 
			change: function( event, ui ) {
		    	frame_val = ui.value;
				if (frame_index > frame_val){
					play_by_play_index =1;
					next_quarter = play_by_play['PERIOD'][play_by_play_index]
					next_game_clock = play_by_play['GAMECLOCK'][play_by_play_index]
				}
				frame_index = frame_val;
				moment_index = 1000*frame_index;
				e_slider_text.html('Frame: '+frame_index);
				clearInterval(interval);
				loadGame(getDataPath(game_index, frame_index));
			}
		})
	});
	return e_slider_holder
}

function createGameChooser() {
	game_chooser_div = $('<div class="dropdown">'+
				'<button class="btn btn-secondary dropdown-toggle btn-sm" type="button" data-toggle="dropdown">Choose NBA Game'+
				'<span class="caret"></span></button></div>');
	game_list_ul = $('<ul class="dropdown-menu" id="game-chooser"></ul>');
	for (i in game_names){
		game = $('<li>').append($('<a>').attr('href','#').append(game_names[i])).val(i)
		game.bind('click', function(){
			clearInterval(interval);
			game_index = $(this).val()
			$.getJSON(getPlayByPlayPath(game_index), function(json) {
				resetIndex();
				index_event = 0;
				index_moment = 0;
				play_by_play_index = 0;
				play_by_play_ul.children().empty();
				play_by_play = json;
				next_quarter = play_by_play['PERIOD'][play_by_play_index];
				next_game_clock = play_by_play['GAMECLOCK'][play_by_play_index];
				loadGame(getDataPath(game_index, frame_index));
			});
		});

		game_list_ul.append(game);
	}
	game_chooser_div.append(game_list_ul);
	return game_chooser_div;
}

function loadUIElements() {
	main_div = $('<div>').attr('id', 'main'+game_index).attr('class', 'main');
	header_div = $('<div>').attr('class', 'header').append('NBA Game Visualizer');
	inner_div = $('<div>').attr('class', 'inner');
	gameinfo_div = $('<div>').attr('class','gameinfo');
	top_div = $('<div>').attr('class', 'top');
	bottom_div = $('<div>').attr('class', 'bottom');
	score_div = $("<div></div>").attr('class', 'scoreboard');
	event_slider_holder = $('<div id=event_slider_holder></div>')
	play_by_play_div = $('<div>').attr('class', 'play_by_play_holder').append($('<ul>').attr('class', 'play_by_play'));
	top_div.append([score_div, createPauseButton(), createSpeedSlider(), event_slider_holder]);
	inner_div.append([top_div, bottom_div, play_by_play_div]);
	main_div.append([createGameChooser(), gameinfo_div, header_div, inner_div]);
	$('body').append([main_div]);
	svg = d3.select(".top")
		.append("svg")
		.attr("width", width)
		.attr("height", height);

	$('.main').width(width*1.2);
}

function loadGame(file_path) {
	d3.json(file_path, function(error, game_data) {
		if (error) {
			throw error;
		};
		home = game_data.home[0];
		visitor = game_data.visitor[0];
		players = createPlayerList(home, visitor);
		frames = game_data.frames[0];
		max_frames = game_data.max_frame[0];
		game_date = game_data.gamedate[0];
		num_moments = game_data.num_moments[0] + moment_index;
		$('.gameinfo').html(setGameInfo(game_date, visitor.abbreviation, home.abbreviation));
		bottom_div = $('<div>').attr('class', 'bottom');
		visitor_div = createTeamDiv(visitor).attr('class', 'visitor')
		visitor_div.find( "li" ).css('color', team_colors[visitor.abbreviation])
		if (visitor.abbreviation == 'SAS' || visitor.abbreviation == 'BKN'){
			visitor_div.find( "li" ).css('color', 'silver')
		}
		bottom_div.append([visitor_div, createTeamDiv(home).attr('class', 'home')]);
		$('.bottom').replaceWith(bottom_div);
		$('#event_slider_holder').replaceWith(createEventSlider());
		interval = setInterval(drawInterval, animation_speed);
	});
}

function draw(moment) {
	moment_index += 1;
	if (moment == null || moment.moments == null){
		return;
	}
	movement_data = moment.moments;
	players_in_frame = {};
	movement_data.forEach(function(f) {
		f.team_id = f[0];
		f.player_id = f[1];
		f.x = f[2];
		f.y = f[3];
		f.h = f[4];
		players_in_frame[f.player_id] = true;
	});
	updatePlayerList(players_in_frame);
	loadScoresIntoScoreboard(moment);

	if (first_animation){
		first_animation = false;
		var nodes = svg
			.selectAll("g")
			.data(movement_data)
			.enter()
			.append('g')
			
		nodes.append("circle")
			.attr("cx", xMap)
			.attr("cy", yMap)
			.attr("r", getRadius)
			.style("fill", getColor);

		nodes.append("text")
			.attr("x", xMapText)
			.attr("y", yMap)
			.text(getText);

		svg.selectAll("g").sort(sortBallFirst);
	} else {
		var nodes = svg
				.selectAll("g")
				.data(movement_data)

		nodes.select("circle")
			.attr("cx", xMap)
			.attr("cy", yMap)
			.attr("r", getRadius)
			.style("fill", getColor);

		nodes.select("text")
			.attr("x", xMapText)
			.attr("y", yMap)
			.text(getText);

		svg.selectAll("g").sort(sortBallFirst);
	}
}

function main(){
	loadUIElements();
	$.getJSON(getPlayByPlayPath(game_index), function(json) {
		play_by_play_index = 0;
		play_by_play = json
		next_quarter = play_by_play['PERIOD'][play_by_play_index]
		next_game_clock = play_by_play['GAMECLOCK'][play_by_play_index]
		loadGame(getDataPath(game_index, frame_index));
	});
}

main()
