
var group,
	mouseX = 0, mouseY = 0, mouseZ = 0,
	windowHalfX = window.innerWidth / 2,
	windowHalfY = window.innerHeight / 2;


var scene = new THREE.Scene();

var camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 10000 );
	camera.position.x = 0;
	camera.position.y = 0;
	camera.position.z = 500;
	camera.target = new THREE.Vector3();
	scene.add( camera );

var container = document.createElement( 'div' );
	document.body.appendChild( container );


var renderer = new THREE.CanvasRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.sortObjects = false;
	container.appendChild( renderer.domElement );

document.addEventListener( 'mousemove', onDocumentMouseMove, false );
document.addEventListener( 'mousewheel', onDocumentMouseWheel, false );


function onDocumentMouseMove(event) {

	mouseX = ( event.clientX - windowHalfX )*5;
	mouseY = ( event.clientY - windowHalfY )*5;

	camera.position.x += ( mouseX - camera.position.x ) * 0.01;
	camera.position.y += ( - mouseY - camera.position.y ) * 0.01;

}


				var stats = new Stats();
				stats.domElement.style.position = 'absolute';
				stats.domElement.style.top = '0px';
				stats.domElement.style.zIndex = 100;
				container.appendChild( stats.domElement );

function onDocumentMouseWheel( event ) {
	mouseZ -= event.wheelDeltaY;
	if (mouseZ > 1000){
		mouseZ = 1000;
	}
	else if(mouseZ < -1000){
		mouseZ = -1000
	}
}


var PI2 = Math.PI * 2;
var program = function ( context ) {

	context.beginPath();
	context.arc( 0, 0, 0.5, 0, PI2, true );
	context.fill();

}




renderer.setClearColor(0x8eb2ef, 1);

var backgroundTexture = THREE.ImageUtils.loadTexture('sky_background1.png');

var bg = new THREE.Mesh(
  new THREE.PlaneGeometry(2, 2, 0),
  new THREE.MeshBasicMaterial({map: backgroundTexture})
);

bg.material.depthTest = false;
bg.material.depthWrite = false;


var bgScene = new THREE.Scene();
var bgCam = new THREE.Camera();
bgScene.add(bgCam);
bgScene.add(bg);


//camera.lookAt( scene.position );

for (var i = 0; i < 100; i ++){

	num = 0;
	group = new THREE.Object3D();
	scene.add( group );

	factor = 2000;


	var texture = THREE.ImageUtils.loadTexture('balloon_skinny.png');

	var material = new THREE.SpriteMaterial( {
		program: program, 
		map: texture,
		transparent: true
	} );

	particle = new THREE.Sprite( material );
	particle.position.x = 4* window.innerWidth  *(Math.random() - .5);
	particle.position.y = 4* window.innerHeight * (Math.random()-.2);
	particle.position.z = -500
	particle.scale.x = particle.scale.y = Math.random() * 10 + 10;
	group.add( particle );
}






animate();



function animate() {
	requestAnimationFrame( animate );
	render();
	stats.update();
	if ( document.getElementById("sky_stats")){
	document.getElementById("sky_stats").innerHTML ="Camera X: " + parseInt(camera.position.x) + "</br>"
	+ "Camera Y: " + parseInt(camera.position.y) + "</br>"
	+ "Camera Z: " + parseInt(camera.position.z);
	}	
}

var num = 0;
function render() {


if (num == 1){
	num = 0;
	group = new THREE.Object3D();
	scene.add( group );

	factor = 2000;


	var texture = THREE.ImageUtils.loadTexture('balloon_skinny.png');

	var material = new THREE.SpriteMaterial( {
		program: program, 
		map: texture,
		transparent: true
	} );

	particle = new THREE.Sprite( material );
	particle.position.x = 10* window.innerWidth  *(Math.random() - .5);
	particle.position.y = 10* window.innerHeight * (Math.random()-.5);
	particle.position.z = camera.position.z- 1000;
	particle.scale.x = particle.scale.y = Math.random() * 10 + 10;
	group.add( particle );
}
else{
	num ++;
}



	camera.position.x += ( mouseX - camera.position.x ) * 0.01;
	camera.position.y += ( - mouseY - camera.position.y ) * 0.01;
	if (mouseZ>300){
		camera.position.z += (mouseZ-300)*0.01;
	}
	else if (mouseZ<-300){
		camera.position.z += (mouseZ+300)*0.01;
	}
	camera.position.z -=1;

//		camera.position.z += 100;
//	camera.lookAt( scene.position );

renderer.autoClear = false;
renderer.clear();
	renderer.render(bgScene, bgCam);
	renderer.render(scene, camera);

}



