var gl;
var shaderProgram;
var vertexShader;
var fragmentShader;

var timeDelta = 0;
var timeElapsed = 0;
var timePrevious = 0;

var lives = 5;
var game_running = true;
var lostGame = false;
var wonGame = false;

var spaceship = [];
var aliens = [];
var alienShots = [];
var spaceshipShots = [];

var adjustedLD, ndc, sunWinCoords, l_pos;

function renderScene(){
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	mat4.identity(modelMatrix);
	mat4.identity(viewMatrix);
	mat4.identity(projectionMatrix);
	cameras[currentCamera].doProjection();
	cameras[currentCamera].doView();
	
	gl.useProgram(shaderProgram);
	
	gl.uniform1i(shaderProgram.uniform_shadowOn,0);
	
	//console.log(spaceshipVertexPositionBuffer);
	spaceship.draw();
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, gunshipnormalTex);
	gl.uniform1i(shaderProgram.tex_loc0, 0);
	drawSquareParticula();
	
	
	//COISAS UTEIS PARA O LENS FLARE
	/*
	calculateDerivedMatrices();
	l_pos = [0,0,0,1];
	adjustedLD = [0,0,0,0];
	mat4.multiplyVec4(pvmMatrix,l_pos,adjustedLD);
	console.log("ALD\n" + adjustedLD);
	console.log("pvm\n" + pvmMatrix);
	//console.log("pos\n" + l_pos);
	ndc = adjustedLD;
	ndc[0] = adjustedLD[0] / adjustedLD[3];
	ndc[1] = adjustedLD[1] / adjustedLD[3];
	ndc[2] = adjustedLD[2] / adjustedLD[3];
	sunWinCoords = [0,0,0];
	sunWinCoords[0] = gl.viewportWidth / 2.0*ndc[0] + 0 + gl.viewportWidth/2.0;
	sunWinCoords[1] = gl.viewportHeight / 2.0*ndc[1] + 0 + gl.viewportHeight/2.0;
	//using n=0.f, f=1000.f (also used in ortho and perspective)
	sunWinCoords[2] = 0.5*(1000.0-0.1)*ndc[2] + (1000.0 + 0.1)*0.5;
	*/
}

function update(){
	//timeElapsed = glutGet(GLUT_ELAPSED_TIME);
	//timeDelta = timeElapsed - timePrevious;
	timeDelta = 33;
	//timePrevious = timeElapsed;
	if (game_running == true) {
		//physics(timeDelta);

		//alienShots(timeDelta);
		//followCam->updatePosition(spaceship->position.getX(), spaceship->position.getY(), spaceship->position.getZ());
		//followCam->setCamXYZ(camX, camY, camZ);
		//cleanupProjectiles();
		//collisions();
		if (lives <= 0) {
			lostGame = true;
			game_running = false;
		}
		if (aliens.length <= 0) {
			wonGame = true;
			game_running = false;
		}
	}
}


function getShader(gl, id) {
	var shaderScript = document.getElementById(id);
	if (!shaderScript)
	return null;
	var str = "";

	var k = shaderScript.firstChild;
	while (k) {
	if (k.nodeType == 3)
		str += k.textContent;
		k = k.nextSibling;
	}
	var shader;
	if (shaderScript.type == "x-shader/x-fragment") {
		shader = gl.createShader(gl.FRAGMENT_SHADER);
	} else if (shaderScript.type == "x-shader/x-vertex") {
		shader = gl.createShader(gl.VERTEX_SHADER);
	} else {
		return null;
	}
	gl.shaderSource(shader, str);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert(gl.getShaderInfoLog(shader));
		return null;
	}
	return shader;
}

function initShaders() {
	fragmentShader = getShader(gl, "shader-fs");
	vertexShader = getShader(gl, "shader-vs");
	shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);
	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)){
		console.log(gl.getProgramInfoLog(shaderProgram));
		alert("Could not initialise shaders");
	}
	gl.useProgram(shaderProgram);
	shaderProgram.vertexposAttribute = gl.getAttribLocation(shaderProgram, "position");
	shaderProgram.normalAttribute = gl.getAttribLocation(shaderProgram, "normal");
	shaderProgram.texcoordAttribute = gl.getAttribLocation(shaderProgram, "texCoord");
	shaderProgram.fontposAttribute = gl.getAttribLocation(shaderProgram, "vVertex");
	shaderProgram.fonttexAttribute = gl.getAttribLocation(shaderProgram, "vtexCoord");
	shaderProgram.tangentAttribute = gl.getAttribLocation(shaderProgram, "tangent");
	
	gl.enableVertexAttribArray(shaderProgram.vertexposAttribute);
	gl.enableVertexAttribArray(shaderProgram.normalAttribute);
	gl.enableVertexAttribArray(shaderProgram.texcoordAttribute);
	
	//têm de ser enabled apenas quando usados, senão dá erro
	//gl.enableVertexAttribArray(shaderProgram.fontposAttribute);
	//gl.enableVertexAttribArray(shaderProgram.fonttexAttribute);
	//por exemplo assim
	//gl.enableVertexAttribArray(shaderProgram.tangentAttribute);
	//... bind tangents, drawElements ...
	//gl.disableVertexAttribArray(shaderProgram.tangentAttribute);
	
	shaderProgram.materialAmbientColorUniform = gl.getUniformLocation(shaderProgram, "matambient");
	shaderProgram.materialDiffuseColorUniform = gl.getUniformLocation(shaderProgram, "matdiffuse");
	shaderProgram.materialSpecularColorUniform = gl.getUniformLocation(shaderProgram, "matspecular");
	shaderProgram.materialShininessUniform = gl.getUniformLocation(shaderProgram, "matshininess");
	shaderProgram.materialTexCount = gl.getUniformLocation(shaderProgram, "mattexCount");
	
	
	shaderProgram.pvm_uniformId = gl.getUniformLocation(shaderProgram, "m_pvm");
	shaderProgram.vm_uniformId = gl.getUniformLocation(shaderProgram, "m_viewModel");
	shaderProgram.normal_uniformId = gl.getUniformLocation(shaderProgram, "m_normal");
	shaderProgram.lPos_uniformIdPoint0 = gl.getUniformLocation(shaderProgram, "l_pospoint0");
	shaderProgram.lPos_uniformIdPoint1 = gl.getUniformLocation(shaderProgram, "l_pospoint1");
	shaderProgram.lPos_uniformIdPoint2 = gl.getUniformLocation(shaderProgram, "l_pospoint2");
	shaderProgram.lPos_uniformIdPoint3 = gl.getUniformLocation(shaderProgram, "l_pospoint3");
	shaderProgram.lPos_uniformIdPoint4 = gl.getUniformLocation(shaderProgram, "l_pospoint4");
	shaderProgram.lPos_uniformIdPoint5 = gl.getUniformLocation(shaderProgram, "l_pospoint5");
	shaderProgram.lPos_uniformIdGlobal = gl.getUniformLocation(shaderProgram, "l_posdir");
	shaderProgram.lPos_uniformIdSpot = gl.getUniformLocation(shaderProgram, "l_posspot");
	shaderProgram.lPos_uniformIdSpotDirection = gl.getUniformLocation(shaderProgram, "l_spotdir");
	shaderProgram.uniform_pointOn = gl.getUniformLocation(shaderProgram, "l_pointOn");
	shaderProgram.uniform_dirOn = gl.getUniformLocation(shaderProgram, "dirOn");
	shaderProgram.uniform_spotOn = gl.getUniformLocation(shaderProgram, "spotOn");
	shaderProgram.uniform_lightState = gl.getUniformLocation(shaderProgram, "lightState");

	shaderProgram.texMode_uniformId = gl.getUniformLocation(shaderProgram, "texMode");
	shaderProgram.tex_loc0 = gl.getUniformLocation(shaderProgram, "texmap0");
	shaderProgram.tex_loc1 = gl.getUniformLocation(shaderProgram, "texmap1");
	shaderProgram.tex_loc2 = gl.getUniformLocation(shaderProgram, "texmap2");
	shaderProgram.tex_loc3 = gl.getUniformLocation(shaderProgram, "texmap3");
	shaderProgram.tex_loc4 = gl.getUniformLocation(shaderProgram, "texmap4");
	shaderProgram.tex_loc5 = gl.getUniformLocation(shaderProgram, "texmap5");
	shaderProgram.tex_loc6 = gl.getUniformLocation(shaderProgram, "texmap6");
	shaderProgram.tex_loc7 = gl.getUniformLocation(shaderProgram, "texmap7");
	shaderProgram.tex_loc8 = gl.getUniformLocation(shaderProgram, "texmap8");
	shaderProgram.tex_loc9 = gl.getUniformLocation(shaderProgram, "texmap9");
	shaderProgram.tex_loc10 = gl.getUniformLocation(shaderProgram, "texmap10");
	shaderProgram.tex_loc11 = gl.getUniformLocation(shaderProgram, "texmap11");
	shaderProgram.tex_loc12 = gl.getUniformLocation(shaderProgram, "texmap12");
	shaderProgram.tex_loc13 = gl.getUniformLocation(shaderProgram, "texmap13");
	shaderProgram.tex_loc14 = gl.getUniformLocation(shaderProgram, "texmap14");
	shaderProgram.tex_loc15 = gl.getUniformLocation(shaderProgram, "texmap15");

	shaderProgram.uniform_foggy = gl.getUniformLocation(shaderProgram, "fogMode");
	shaderProgram.uniform_shadowOn = gl.getUniformLocation(shaderProgram, "shadowOn");
}

function setupGLDetails(){
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);
	gl.depthMask(gl.TRUE);
	gl.depthRange(0.0, 1.0);
	gl.clearDepth(1.0);
	gl.enable(gl.CULL_FACE);
	gl.cullFace(gl.BACK);
	gl.frontFace(gl.CCW);
}

function setupThings(){
	ratio = gl.viewportWidth/gl.viewportHeight;
	cameras[0] = new TopOrthoCamera(-6.0* ratio, 6.0* ratio, -6.0, 6.0, 0.1, 1000.0, 0.0, 10.0, 5.0);
	
	
	loadSpaceshipTexture();
	loadSpaceship();
	spaceship = new Spaceship(-5.8, 5.8);
}


function cycle(){
	requestAnimFrame(cycle);
	if(texturesLeft >0) return;
    update();
	renderScene();
}

function webGLStart() {
	var canvas = document.createElement('canvas');
	canvas.id = "myCanvas";
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	document.body.appendChild(canvas);
	
	try {
		gl = canvas.getContext("experimental-webgl");
		gl.viewportWidth = canvas.width;
		gl.viewportHeight = canvas.height;
	} catch (e) {
	}
	if (!gl) {
		alert("Could not initialise WebGL, sorry :-(");
	}
	
	initShaders();
	//initBuffers();
	setupThings();
	setupGLDetails();
	cycle();
}