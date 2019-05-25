var winWidth, winHeight;
var hovered;
var playButton = {}, optionsButton = {};
var buttons = [];
var fontSize;
var maxFontSize;
function setupMenu() {
    menu = true;
    
    winWidth = window.innerWidth;
    winHeight = window.innerHeight;
    menuResize();
    addButtons();
    
    addMenuEvents();
    updateMenu();
}

function resetMenu() {
    menu = true;
    
    winWidth = window.innerWidth;
    winHeight = window.innerHeight;
    menuResize();
    
    addMenuEvents();
    updateMenu();
}

function addButtons() {
    ctx2d.font = this.fontSize + "px Arial";
    addText("3D Dots and Boxes!", winHeight/4, "#ff7777", null);
    addText("Play", winHeight/2, "#7777ff", function() {
        closeMenu();
        setupGame();
    });
    addText("Options", winHeight*3/4, "#77ff77", function() {
        closeMenu();
        setupOptions();
    });
}

function addText(atext, yPos, colour, buttonFunction) {
    var width = ctx2d.measureText(atext).width;
    var height = fontSize;
    var x = winWidth/2-width/2;
    var y = yPos;

    var temp = new Button(atext, x, y, width, height, colour, fontSize, buttonFunction);
    switch (atext) {
        case "Play":
            playButton = temp;
            break;
        case "Options":
            optionsButton = temp;
            break;
    }
}

function menuMouseDown(e) {
    e.preventDefault();
    if (hovered) {
        hovered.buttonFunction();
    }
}

function menuMouseMove(e) {
    var oldHovered = hovered;
    var hovering = false;
    if (playButton.checkMouse(e.clientX, e.clientY)) {
        hovered = playButton;
        hovering = true;
    }
    if (optionsButton.checkMouse(e.clientX, e.clientY)) {
        hovered = optionsButton;
        hovering = true;
    }
    if (oldHovered && oldHovered != hovered) {
        oldHovered.fontSize = fontSize;
        oldHovered.calculateDimensions();
    }
    if (hovering == false && hovered) {
        oldHovered.fontSize = fontSize;
        oldHovered.calculateDimensions();
        hovered = null;
    }
}

function makeLarger(button) {
    var speed = 5;
    button.fontSize += speed - speed*button.fontSize/maxFontSize;
    button.calculateDimensions();
}

function drawScene() {
    clearCanvas();
    for (var i=0;i<buttons.length;i++) {
        buttons[i].draw();
    }
}

function menuResize(e) {
    //do this because resize can spam this event
    requestAnimationFrame(function() {
        canvas2d.width = window.innerWidth;
        canvas2d.height = window.innerHeight;
        
        maxFontSize = window.innerWidth/10;
        fontSize = window.innerWidth/15;
        for (var i=0;i<buttons.length;i++) {
            buttons[i].fontSize = window.innerWidth/15;
            buttons[i].calculateResize(winHeight);
        }
        winWidth = window.innerWidth;
        winHeight = window.innerHeight;
        drawScene();
    });
}

function addMenuEvents() {
    document.addEventListener('mousemove', menuMouseMove);
    document.addEventListener('mousedown', menuMouseDown);
    window.addEventListener('resize', menuResize);
}

function removeMenuEvents() {
    document.removeEventListener('mousemove', menuMouseMove);
    document.removeEventListener('mousedown', menuMouseDown);
    window.removeEventListener('resize', menuResize);
}

function closeMenu() {
    menu = false;
    removeMenuEvents();
    clearCanvas();
    hovered = null;
}

function updateMenu() {
    if (menu) {
        if (hovered) {
            makeLarger(hovered);
        }
        drawScene();
        requestAnimationFrame(updateMenu);
    }
}

function Button(text, x, y, width, height, colour, fontSize, buttonFunction) {
    this.text = text;
    this.x = x;
    this.y = y;
    this.actualY = y-height;
    this.width = width;
    this.height = height;
    this.colour = colour;
    this.fontSize = fontSize;
    this.buttonFunction = buttonFunction;
    buttons.push(this);
    this.draw = function() {
        ctx2d.font = this.fontSize + "px Arial";
        ctx2d.fillStyle = this.colour;
        ctx2d.fillText(this.text, this.x, this.y);
    }
    this.checkMouse = function(mouseX, mouseY) {
        if (mouseX >= this.x && mouseX <= this.x+this.width && 
            mouseY >= this.actualY && mouseY <= this.actualY+this.height) {
            return true;
        }
        return false;
    }
    this.calculateDimensions = function() {
        ctx2d.font = this.fontSize + "px Arial";
        this.width = ctx2d.measureText(this.text).width;
        this.height = this.fontSize;
        this.x = window.innerWidth/2-this.width/2;
        this.actualY = this.y-this.height;
    }
    this.calculateResize = function(oldHeight) {
        this.y = (this.y/oldHeight)*window.innerHeight;
        this.calculateDimensions();
    }
}