var size;
var dotSize = 0.5;

var gap = 20;

var minDist;
var maxDist;
var distance = 80;

var dots = [];
var lines = [];
//store the array indices for the lines that make up each cube
var cubes = [];

var hoveredLine;
var lineColour = 0x444444;;
var playerColours = [];
var numPlayers;
var currplayer;
var playerScores = [];

var mouseX, mouseY;

var splodges;

var raycaster = new THREE.Raycaster();

var dotMat = new THREE.MeshBasicMaterial({color: 0x000000});
var dotGeom = new THREE.SphereGeometry(5, 32, 32);
var dotMenuGeom = new THREE.SphereGeometry(1.3, 32, 32);

var lineMat = new THREE.MeshBasicMaterial({color: lineColour});
lineMat.transparent = true;
lineMat.opacity = 0.5;
var lineGeom = new THREE.BoxGeometry(1, 1, 1);

//0 is left mouse, 1 is scroll wheel down, 2 is right mouse
var mouseButtons = [false, false, false];

//right mouse by default
var rotateButton;

var clickButton;

/**
 * Sets up the scene and other stuff
 */
function setupGame() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);
    
    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
    
    renderer = new THREE.WebGLRenderer({canvas: canvas});
	renderer.setSize(window.innerWidth, window.innerHeight);
    
    game = true;
    
    setupVariables();
    camera.position.z = distance;
    displayScore();
    addEvents();
    addDots();
    addLines();
    animate();
}
/**
 * setup variables
 */
function setupVariables() {
    size = new THREE.Vector3(optionVars.x, optionVars.y, optionVars.z);
    for (var i=0;i<playerVars.playerColours.length;i++) {
        var colour = new THREE.Color(playerVars.playerColours[i]);
        if (playerColours[i]) {
            playerColours = colour
        } else {
            playerColours.push(colour);
        }
    }
    numPlayers = optionVars.numPlayers;
    
    splodges = [];
    for (var i=0;i<numPlayers;i++) {
        //document.getElementById("splodgePath").style.setProperty("fill", playerColours[i]);
        document.getElementById("splodgePath").setAttribute('style', 'fill: #' + playerColours[i].getHexString());
        var srctext = "data:image/svg+xml;base64, " + window.btoa(new XMLSerializer().serializeToString(document.getElementById("splodge")));
        var splodge = new Image();
        splodge.src = srctext;
        splodges.push(splodge);
    }
    
    var max = Math.max(size.x, size.y, size.z);
    minDist = 0.5*3*(max*gap/4);
    distance = 1.5*3*(max*gap/4);
    maxDist = 2*3*(max*gap/4);
    
    currplayer = playerVars.firstPlayer;
    
    for (var i=0;i<numPlayers;i++) {
        playerScores.push(0);
    }
    rotateButton = 2;
    clickButton = 0;
}

/**
 * Adds the dots
 * note doesn't actually use the dots array because dots are purely visual
 */
function addDots() {
    dots = [];
    for (var i=0;i<size.x;i++) {
        var posX = getPos(i, size.x);
        for (var j=0;j<size.y;j++) {
            var posY = getPos(j, size.y);
            for (var k=0;k<size.z;k++) {
                var posZ = getPos(k, size.z);
                
                var tempDot = new THREE.Mesh(dotGeom, dotMat);
                tempDot.scale.multiplyScalar(dotSize);
                
                var pos = new THREE.Vector3(posX, posY, posZ);
                
                tempDot.position.copy(pos);
                scene.add(tempDot);
            }
        }
    }
    
    //gets the position of the dot along one axis given parameters
    function getPos(num, maxNum) {
        var position = gap*(num-(maxNum-1)/2);
        return position;
    }
}

/**
 * draws the lines
 * feels like it could be much more efficient
 * terribly complicated but fixing it might be more complicated than it's worth
 * and efficiency isn't too important since it only runs once
 */
function addLines() {
    //reset lines and cubes
    lines = [];
    cubes = [];
    //loop through each depth
    for (var i=0;i<size.z;i++) {
        //different pos from others
        //this is the depth of the dot rather than the position between the dots
        var posZ = getPosDot(i, size.z)
        for (var j=0;j<size.x-1;j++) {
            var posX = getPosDot(j, size.x-1);
            for (var k=0;k<size.y;k++) {
                var posY = getPosDot(k, size.y);
                
                var pos = new THREE.Vector3(posX, posY, posZ);
                
                //cubes
                //below
                var lineCubes = [];
                if (i < size.z-1) {
                    if (k < size.y-1) {
                        lineCubes.push((size.x-1)*(size.y-1)*i + (size.x-1) * k + j);
                    }
                    if (k > 0) {
                        lineCubes.push((size.x-1)*(size.y-1)*i + (size.x-1) * (k-1) + j);
                    }
                }
                if (i > 0) {
                    if (k < size.y-1) {
                        lineCubes.push((size.x-1)*(size.y-1)*(i-1) + (size.x-1) * k + j);
                    }
                    if (k > 0) {
                        lineCubes.push((size.x-1)*(size.y-1)*(i-1) + (size.x-1) * (k-1) + j);
                    }
                }
                
                
                addLine(pos, "x", lineCubes);
            }
        }
        for (var k=0;k<size.y-1;k++) {
            var posY = getPosDot(k, size.y-1);
            for (var j=0;j<size.x;j++) {
                var posX = getPosDot(j, size.x);
                
                var pos = new THREE.Vector3(posX, posY, posZ);
                
                var lineCubes = [];
                if (i < size.z-1) {
                    if (j < size.x-1) {
                        lineCubes.push((size.x-1)*(size.y-1)*i + (size.x-1) * k + j);
                    }
                    if (j > 0) {
                        lineCubes.push((size.x-1)*(size.y-1)*i + (size.x-1) * k + j-1);
                    }
                }
                if (i > 0) {
                    if (j < size.x-1) {
                        lineCubes.push((size.x-1)*(size.y-1)*(i-1) + (size.x-1) * k + j);
                    }
                    if (j > 0) {
                        lineCubes.push((size.x-1)*(size.y-1)*(i-1) + (size.x-1) * k + j-1);
                    }
                }
                
                addLine(pos, "y", lineCubes);
            }
        }
    }
    for (var i=0;i<size.z-1;i++) {
        var posZ = getPosDot(i, size.z-1);
        for (var j=0;j<size.x;j++) {
            var posX = getPosDot(j, size.x);
            for (var k=0;k<size.y;k++) {
                var posY = getPosDot(k, size.y);
                
                var pos = new THREE.Vector3(posX, posY, posZ);
                
                var lineCubes = [];
                
                //cubes above
                if (k < size.y-1) {
                    //above and right
                    if (j < size.x-1) {
                        lineCubes.push((size.x-1)*(size.y-1)*i + (size.x-1) * k + j);
                    }
                    //above and left
                    if (j > 0) {
                        lineCubes.push((size.x-1)*(size.y-1)*i + (size.x-1) * k + j-1);
                    }
                }
                //cubes below
                if (k > 0) {
                    //below and right
                    if (j < size.x-1) {
                        lineCubes.push((size.x-1)*(size.y-1)*i + (size.x-1) * (k-1) + j);
                    }
                    //below and left
                    if (j > 0) {
                        lineCubes.push((size.x-1)*(size.y-1)*i + (size.x-1) * (k-1) + j-1);
                    }
                }
                
                addLine(pos, "z", lineCubes);
            }
        }
    }
    //added all the cubes to the lines, now fill the cubes array with the lines
    //make cubes array correct length
    for (var i=0;i<(size.x-1)*(size.y-1)*(size.z-1);i++) {
        cubes.push([]);
    }
    for (var i=0;i<lines.length;i++) {
        for (var j=0;j<lines[i].cubes.length;j++) {
            cubes[lines[i].cubes[j]].push(i);
        }
    }
    
    
    //
    function getPosDot(num, maxNum) {
        return gap*(num-(maxNum-1)/2);
    }
    //
    function addLine(position, longAxis, lineCubes=[]) {
        var tempMat = new THREE.MeshBasicMaterial({color: lineColour});
        tempMat.transparent = true;
        tempMat.opacity = 0.5;
        var tempGeom = new THREE.BoxGeometry(1, 1, 1);
        var tempLine = new THREE.Mesh(tempGeom, tempMat);
        
        //add cubes to line
        
        tempLine.cubes = lineCubes;
        
        //property for what status this line is
        //(-1 is not clicked, other numbers are players)
        tempLine.status = -1;
        
        tempLine.scale[longAxis] = gap;
        
        tempLine.position.copy(position);
        scene.add(tempLine);
        lines.push(tempLine);
    }
}

/**
 * Rotates around the centre 
 * parameters are the amount the mouse has moved on the screen
 */
function rotateAround(mouseX, mouseY) {
    var spherical = new THREE.Spherical().setFromVector3(camera.position);
    spherical.theta -= 2 * Math.PI * mouseX / window.innerHeight;
	spherical.phi -= 2 * Math.PI * mouseY / window.innerHeight;
    spherical.makeSafe();
    
    spherical.radius = distance;
    
    camera.position.setFromSpherical( spherical );
    
    camera.lookAt( new THREE.Vector3() );
}

/**
 * Check for a line and change its colour
 * parameters are the position on the screen
 */
function checkLine(mouseX, mouseY) {
    //if not player, ignore this
    if (playerVars.playerAIs[currplayer] != AI_VALUES.player) {
        return;
    }
    //convert mouseX/Y to normalised co-ords(-1 to 1)
    var normMouse = new THREE.Vector2();
    normMouse.x = (mouseX/window.innerWidth) * 2 - 1;
    normMouse.y = -((mouseY/window.innerHeight) * 2 - 1);
    
    raycaster.setFromCamera(normMouse, camera);
    
    var intersects = raycaster.intersectObjects(lines);
    var hovered = false;
    for (var i=0;i<intersects.length;i++) {
        if (intersects[i].object.status == -1) {
            hovered = true;
            hoveredLine = intersects[i].object;
            intersects[i].object.material.color = playerColours[currplayer];
            break;
        }
    }
    if (!hovered) {
        hoveredLine = null;
    }
}

/**
 * draws the cube
 */
function drawCube(cubeNum) {
    var num = cubeNum;
    var posZ = Math.floor(num / ((size.x-1)*(size.y-1)));
    num -= (size.x-1)*(size.y-1)*posZ;
    var posY = Math.floor(num / (size.x-1));
    num -= (size.x-1)*posY;
    var posX = num;
    
    posZ -= (size.z-2)/2;
    posY -= (size.y-2)/2;
    posX -= (size.x-2)/2;
    
    var pos = new THREE.Vector3(posX, posY, posZ).multiplyScalar(gap);
    
    var cubeMat = new THREE.MeshBasicMaterial({color: playerColours[currplayer]});
    cubeMat.transparent = true;
    cubeMat.opacity = 0.5;
    var cubeGeom = new THREE.BoxGeometry(1, 1, 1);
    var cube = new THREE.Mesh(cubeGeom, cubeMat);
    
    cube.scale.set(gap, gap, gap);
    
    cube.position.copy(pos);
    
    scene.add(cube);
}

/**
 * checks cubes for a given line
 * fun array action!!!
 */
function checkCubes(line) {
    var finished = false;
    //only need to check cubes the line is part of
    for (var i=0;i<line.cubes.length;i++) {
        var count = 0;
        for (var j=0;j<cubes[line.cubes[i]].length;j++) {
            if (lines[cubes[line.cubes[i]][j]].status != -1) {
                count++;
            }
        }
        //a cube will always have 12 lines around it
        //but this is better
        if (count == cubes[line.cubes[i]].length) {
            finished = true;
            playerScores[currplayer] += 1;
            drawCube(line.cubes[i]);
        }
    }
    return finished;
}

function handleClick() {
    setLine(hoveredLine);
    hoveredLine = null;
}

function setLine(line) {
    line.status = currplayer;
    line.material.opacity = 1;
    line.material.color = playerColours[currplayer];
    var finishedCube = checkCubes(line);
    if (!finishedCube) {
        currplayer = (currplayer + 1) % numPlayers;
    }
    displayScore();

    switch (playerVars.playerAIs[currplayer]) {
        case AI_VALUES.random:
            getRandomMove();
            break;
        case AI_VALUES.simple:
            getSimpleMove();
            break;

    }
}

function displayScore() {
    clearCanvas();
    ctx2d.font = "20px Arial";
    ctx2d.fillStyle = "black";
    
    for (var i=0;i<playerScores.length;i++) {
        var prestring = "   ";
        if (currplayer == i) {
            prestring = "> ";
        }
        ctx2d.fillText(prestring + "Player " + (i+1) + ": " + playerScores[i], 0, (i+1)*20);
        if (splodges[i].complete) {
            ctx2d.drawImage(splodges[i], 120, i*20+2, 20, 20);
        } else {
            const num = i;
            splodges[i].onload = function() {
                ctx2d.drawImage(splodges[num], 120, num*20+2, 20, 20);
            }
        }
    }
}

/**
 * Render scene
 */
function animate() {
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

/**
 * handle events simply
 */
function contextmenu(e) {
    //stop right click menu from popping up
    e.preventDefault();
}

function mouseDown(e) {
    mouseButtons[e.button] = true;
    if (e.button == clickButton && hoveredLine) {
        handleClick();
    }
}

function mouseUp(e) {
    mouseButtons[e.button] = false;
}

//note could use e.buttons instead
function mouseMove(e) {
    //remove colour from old hoveredLine
    if (hoveredLine) {
        hoveredLine.material.color = new THREE.Color(lineColour);
    }
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    checkLine(e.clientX, e.clientY);
    if (mouseButtons[rotateButton] == true) {
        //use e.movementX/Y to rotate camera around centre
        //do this by thinking about a sphere the camera should be on around the centre
        rotateAround(e.movementX, e.movementY);
    }
}

/**
 * Used for zooming
 */
function mouseWheel(e) {
    distance = Math.max(minDist, Math.min(maxDist, e.deltaY*0.1+distance));
    
    var spherical = new THREE.Spherical().setFromVector3(camera.position);
    spherical.radius = distance;
    camera.position.setFromSpherical(spherical);
    camera.lookAt(new THREE.Vector3());
    
    //remove colour from old hoveredLine
    if (hoveredLine) {
        hoveredLine.material.color = new THREE.Color(lineColour);
    }
    
    checkLine(mouseX, mouseY);
}

/**
 * Events being added
 */
function addEvents() {
    document.addEventListener('contextmenu', contextmenu);
    document.addEventListener('mousedown', mouseDown);
    document.addEventListener('mouseup', mouseUp);
    document.addEventListener('mousemove', mouseMove);
    document.addEventListener('wheel', mouseWheel);
}

function removeEvents() {
    document.removeEventListener('contextmenu', contextmenu);
    document.removeEventListener('mousedown', mouseDown);
    document.removeEventListener('mouseup', mouseUp);
    document.removeEventListener('mousemove', mouseMove);
    document.removeEventListener('wheel', mouseWheel);
}