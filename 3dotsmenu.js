var menuScene, menuCamera;
var hoveredBox = null;
/**
 * sets up the menu
 * adds stuff to scene
 */
function setupMenu() {
    
    menuScene = new THREE.Scene();
    menuScene.background = new THREE.Color(0xffffff);
    
    menuCamera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
    menuCamera.position.z += 10;
    //have to load font first
    new THREE.FontLoader().load('fonts/helvetiker_regular.typeface.json', function(font) {
        
        var playMat = new THREE.MeshBasicMaterial({color: 0x7777ff});
        var playGeom = new THREE.TextGeometry("Play", {font: font, size:1, height: 0.1});
        var play = new THREE.Mesh(playGeom, playMat);
        play.button = true;
        centreTextMesh(play);
        menuScene.add(play);
        
        var optionsMat = new THREE.MeshBasicMaterial({color: 0x77ff77});
        var optionsGeom = new THREE.TextGeometry("Options", {font: font, size:1, height: 0.1});
        var options = new THREE.Mesh(optionsGeom, optionsMat);
        options.button = true;
        centreTextMesh(options);
        options.position.y -= 3;
        //options.lookAt(menuCamera.position);
        menuScene.add(options);
        
        var titleScreenMat = new THREE.MeshBasicMaterial({color: 0xff7777});
        var titleScreenGeom = new THREE.TextGeometry("3D Dots and Boxes!", {font: font, size:1, height: 0.1});
        var titleScreen = new THREE.Mesh(titleScreenGeom, titleScreenMat);
        titleScreen.button = false;
        centreTextMesh(titleScreen);
        titleScreen.position.y += 3;
        titleScreen.lookAt(menuCamera.position);
        menuScene.add(titleScreen);
        
        addMenuStuff();
        addMenuEvents();
        animateMenu();
    });
    
    function centreTextMesh(mesh) {
        mesh.geometry.computeBoundingBox();
        var box = mesh.geometry.boundingBox;
        var newPos = new THREE.Vector3();
        box.getSize(newPos)
        newPos.divideScalar(-2);
        
        mesh.position.copy(newPos);
        mesh.geometry.computeBoundingBox();
    }
    
    function addMenuStuff() {
        var menugap = new THREE.Vector2(8, 6);
        //add dots
        for (var i=-1;i<2;i+=2) {
            for (var j=-1;j<2;j+=2) {
                var dot = new THREE.Mesh(dotMenuGeom, dotMat);
                dot.position.add(new THREE.Vector3(i*menugap.x, j*menugap.y, 0));
                //dot.scale.multiply(new THREE.Vector3(0.2, 0.2, 0.2));
                dot.button = false;
                menuScene.add(dot);
                
            }
        }
        //x=0, y=-1, x=0, y=1,
        //x=-1, y=0, x=1, y=0
        //x==1, 0, 0, -1
        //y==0, 1, -1, 0
        for (var x=1, first=true;x>=-1;x--) {
            var y=0;
            var longaxis = "y";
            if (x==0) {
                longaxis = "x";
                if (first) {
                    y = 1;
                } else {
                    y = -1;
                }
            }
            
            console.log(x, y);
            
            var line = new THREE.Mesh(lineGeom, lineMat);
            line.position.add(new THREE.Vector3(x*menugap.x, y*menugap.y, 0));
            line.scale[longaxis] *= menugap[longaxis]*2;
            //line.scale.multiply(new THREE.Vector3(0.2, 0.2, 0.2));
            line.button = false;
            
            menuScene.add(line);
            
            if (y == 1) {
                first = false;
                x = 1;
            }
        }
    }
    
    menu = true;
}

function menuMouseMove(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
}

function checkBox(mouseX, mouseY) {
    
    //norm from -1 to 1
    var normMouse = new THREE.Vector2();
    normMouse.x = (mouseX/window.innerWidth)*2-1;
    normMouse.y = -((mouseY/window.innerHeight)*2-1);
    
    raycaster.setFromCamera(normMouse, menuCamera);
    
    var hovered = false;
    for (var i=0;i<menuScene.children.length;i++) {
        if (menuScene.children[i].button == true) {
            var inverseMatrix = new THREE.Matrix4(), ray = new THREE.Ray();
            
            inverseMatrix.getInverse(menuScene.children[i].matrixWorld);
            ray.copy(raycaster.ray).applyMatrix4(inverseMatrix);
            
            if (menuScene.children[i].geometry.boundingBox !== null){
                if (ray.intersectsBox(menuScene.children[i].geometry.boundingBox) === true){
                    hovered = true;
                    if (hoveredBox) {
                        if (hoveredBox != menuScene.children[i]) {
                            hoveredBox.position.z = 0;
                        }
                    }
                    hoveredBox = menuScene.children[i];
                }
            }
        }
    }
    if (!hovered && hoveredBox) {
        hoveredBox.position.z = 0;
        hoveredBox = null;
    }
    return hovered;
}

function menuMouseDown() {
    if (hoveredBox) {
        switch (hoveredBox.geometry.parameters.text) {
            
            case "Play":
                menu = false;
                removeMenuEvents();
                setupGame();
                break;
            case "Options":
                //stuff
        }
    }
}

function addMenuEvents() {
    document.addEventListener('mousemove', menuMouseMove);
    document.addEventListener('mousedown', menuMouseDown);
}

function removeMenuEvents() {
    document.removeEventListener('mousemove', menuMouseMove);
    document.removeEventListener('mousedown', menuMouseDown);
}

function animateMenu() {
    if (mouseX && mouseY) {
        var hovered = checkBox(mouseX, mouseY);
        if (hovered) {
            moveTowards(hoveredBox, menuCamera);
        }
    } 
    renderer.render(menuScene, menuCamera);
    if (menu) {
        requestAnimationFrame(animateMenu);
    }
}

function moveTowards(object, camera) {
    var distance = 5;
    var speed = 0.3;
    var rot = object.rotation.clone();
    object.lookAt(camera.position);
    var dist = object.position.distanceTo(camera.position);
    //object.translateZ(dist*speed/distance - speed);
    /*var test = new THREE.Vector3();
    test.subVectors(object.position, camera.position);
    test.normalize();
    test.multiplyScalar(dist*speed/distance - speed);
    object.position.add(test);*/
    //object.translateOnAxis(camera.position.clone().normalize(), dist*speed/distance - speed);
    object.translateZ(dist*speed/distance - speed);
    object.geometry.computeBoundingBox();
    object.rotation = rot;
}